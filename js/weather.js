/**
 * weather.js
 * Fetches current and forecast weather from Open-Meteo (free, no API key).
 * Provides today, this-week, and this-month summaries.
 */

const Weather = {

  // WMO Weather codes → emoji + description
  WMO_CODES: {
    0: ['☀️', 'Clear sky'],
    1: ['🌤️', 'Mainly clear'],
    2: ['⛅', 'Partly cloudy'],
    3: ['☁️', 'Overcast'],
    45: ['🌫️', 'Foggy'],
    48: ['🌫️', 'Depositing rime fog'],
    51: ['🌦️', 'Light drizzle'],
    53: ['🌦️', 'Moderate drizzle'],
    55: ['🌧️', 'Dense drizzle'],
    61: ['🌧️', 'Slight rain'],
    63: ['🌧️', 'Moderate rain'],
    65: ['🌧️', 'Heavy rain'],
    66: ['🌨️', 'Light freezing rain'],
    67: ['🌨️', 'Heavy freezing rain'],
    71: ['❄️', 'Slight snow'],
    73: ['❄️', 'Moderate snow'],
    75: ['❄️', 'Heavy snow'],
    77: ['🌨️', 'Snow grains'],
    80: ['🌦️', 'Slight rain showers'],
    81: ['🌧️', 'Moderate rain showers'],
    82: ['⛈️', 'Violent rain showers'],
    85: ['🌨️', 'Slight snow showers'],
    86: ['🌨️', 'Heavy snow showers'],
    95: ['⛈️', 'Thunderstorm'],
    96: ['⛈️', 'Thunderstorm with slight hail'],
    99: ['⛈️', 'Thunderstorm with heavy hail'],
  },

  /**
   * Safely convert a precipitation value to a number.
   * API may return null, undefined, or NaN for some days.
   */
  _safeNum(val) {
    if (val === null || val === undefined || isNaN(val)) return 0;
    return Number(val);
  },

  /**
   * Format precipitation as a string. Shows "0.00" only if genuinely zero.
   */
  _formatPrecip(val) {
    return this._safeNum(val).toFixed(2);
  },

  /**
   * Fetch weather data for coordinates and target date.
   * @param {number} lat
   * @param {number} lng
   * @param {string} targetDate - YYYY-MM-DD format
   * @returns {Promise<Object>} weather summary
   */
  async fetch(lat, lng, targetDate) {
    const target = new Date(targetDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    const isForecastRange = diffDays >= 0 && diffDays <= 15;
    const isPast = diffDays < 0 && diffDays >= -92;

    let result;
    if (isForecastRange) {
      result = await this._fetchForecast(lat, lng, targetDate);
    } else if (isPast) {
      result = await this._fetchHistorical(lat, lng, targetDate);
    } else {
      result = this._climateEstimate(lat, target.getMonth() + 1);
    }

    return result;
  },

  async _fetchForecast(lat, lng, targetDate) {
    // Request precipitation_probability_max alongside precipitation_sum
    // for a more complete picture even when precip amounts are tiny
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode,windspeed_10m_max` +
      `&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph` +
      `&precipitation_unit=inch&timezone=auto`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Open-Meteo API error');
    const data = await resp.json();

    return this._parseForecast(data, targetDate);
  },

  async _fetchHistorical(lat, lng, targetDate) {
    const startDate = targetDate;
    const endDate = this._addDays(targetDate, 6);
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
      `&start_date=${startDate}&end_date=${endDate}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max` +
      `&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Open-Meteo Archive API error');
    const data = await resp.json();
    return this._parseHistorical(data, targetDate);
  },

  _parseForecast(data, targetDate) {
    const d = data.daily;
    const dates = d.time;
    const targetIdx = dates.indexOf(targetDate);
    const idx = targetIdx >= 0 ? targetIdx : 0;

    // Check if precipitation_probability_max is available
    const hasProb = Array.isArray(d.precipitation_probability_max);

    // Today's weather
    const todayHigh = Math.round(this._safeNum(d.temperature_2m_max[idx]));
    const todayLow = Math.round(this._safeNum(d.temperature_2m_min[idx]));
    const todayPrecip = this._safeNum(d.precipitation_sum[idx]);
    const todayPrecipProb = hasProb ? this._safeNum(d.precipitation_probability_max[idx]) : null;
    const todayWind = Math.round(this._safeNum(d.windspeed_10m_max[idx]));
    const todayCode = d.weathercode[idx] || 0;
    const [todayIcon, todayDesc] = this.WMO_CODES[todayCode] || ['🌡️', 'Unknown'];

    // Build today detail string
    let todayDetail = `Precip: ${this._formatPrecip(todayPrecip)} in`;
    if (todayPrecipProb !== null) {
      todayDetail += ` (${Math.round(todayPrecipProb)}% chance)`;
    }
    todayDetail += ` · Wind: ${todayWind} mph`;

    // Week summary (next 7 days from target)
    const weekEnd = Math.min(idx + 7, dates.length);
    const weekHighs = d.temperature_2m_max.slice(idx, weekEnd).map(v => this._safeNum(v));
    const weekLows = d.temperature_2m_min.slice(idx, weekEnd).map(v => this._safeNum(v));
    const weekPrecip = d.precipitation_sum.slice(idx, weekEnd).map(v => this._safeNum(v));
    const weekCodes = d.weathercode.slice(idx, weekEnd);
    const weekProbs = hasProb ? d.precipitation_probability_max.slice(idx, weekEnd).map(v => this._safeNum(v)) : [];

    const avgHigh = Math.round(weekHighs.reduce((a, b) => a + b, 0) / weekHighs.length);
    const avgLow = Math.round(weekLows.reduce((a, b) => a + b, 0) / weekLows.length);
    const totalWeekPrecip = weekPrecip.reduce((a, b) => a + b, 0);
    const rainyDays = weekCodes.filter(c => c >= 51).length;
    // Also count days with >20% rain probability as "chance of rain" days
    const probRainyDays = weekProbs.filter(p => p > 20).length;
    const displayRainyDays = Math.max(rainyDays, probRainyDays);

    let weekDetail = `Total precip: ${this._formatPrecip(totalWeekPrecip)} in · ${weekHighs.length}-day forecast`;
    let weekDesc = `${displayRainyDays} rainy day${displayRainyDays !== 1 ? 's' : ''} expected`;

    // Month estimate (extrapolate from all available forecast data)
    const allHighs = d.temperature_2m_max.map(v => this._safeNum(v));
    const allLows = d.temperature_2m_min.map(v => this._safeNum(v));
    const allPrecip = d.precipitation_sum.map(v => this._safeNum(v));
    const monthHigh = Math.round(allHighs.reduce((a, b) => a + b, 0) / allHighs.length);
    const monthLow = Math.round(allLows.reduce((a, b) => a + b, 0) / allLows.length);
    const totalMonthPrecip = allPrecip.reduce((a, b) => a + b, 0);
    // Extrapolate to 30 days if we have fewer
    const daysAvailable = allPrecip.length;
    const extrapolatedMonthPrecip = daysAvailable > 0
      ? (totalMonthPrecip / daysAvailable) * 30
      : 0;

    const allRainyCodes = d.weathercode.filter(c => c >= 51).length;
    const allProbs = hasProb ? d.precipitation_probability_max.map(v => this._safeNum(v)) : [];
    const allProbRainyDays = allProbs.filter(p => p > 20).length;
    const monthRainyDays = Math.max(allRainyCodes, allProbRainyDays);
    const extrapolatedRainyDays = daysAvailable > 0
      ? Math.round((monthRainyDays / daysAvailable) * 30)
      : 0;

    return {
      today: {
        icon: todayIcon,
        temp: `${todayHigh}°F / ${todayLow}°F`,
        desc: todayDesc,
        detail: todayDetail,
        high: todayHigh,
        low: todayLow,
      },
      week: {
        icon: '🗓️',
        temp: `${avgHigh}°F / ${avgLow}°F avg`,
        desc: weekDesc,
        detail: weekDetail,
      },
      month: {
        icon: '📊',
        temp: `${monthHigh}°F / ${monthLow}°F avg`,
        desc: `~${extrapolatedRainyDays} rainy days estimated this month`,
        detail: `Est. monthly precip: ~${this._formatPrecip(extrapolatedMonthPrecip)} in (from ${daysAvailable}-day forecast)`,
      },
      // Raw for plant logic
      avgTemp: (todayHigh + todayLow) / 2,
      isFrosty: todayLow <= 32,
      isHot: todayHigh >= 90,
    };
  },

  _parseHistorical(data, targetDate) {
    const d = data.daily;
    if (!d || !d.time || d.time.length === 0) {
      return this._climateEstimate(0, new Date(targetDate).getMonth() + 1);
    }

    const high = Math.round(this._safeNum(d.temperature_2m_max[0]) || 70);
    const low = Math.round(this._safeNum(d.temperature_2m_min[0]) || 50);
    const precip = this._safeNum(d.precipitation_sum[0]);
    const code = d.weathercode?.[0] || 0;
    const [icon, desc] = this.WMO_CODES[code] || ['🌡️', 'Unknown'];

    const weekHighs = d.temperature_2m_max.map(v => this._safeNum(v));
    const weekLows = d.temperature_2m_min.map(v => this._safeNum(v));
    const weekPrecip = d.precipitation_sum.map(v => this._safeNum(v));
    const avgHigh = Math.round(weekHighs.reduce((a, b) => a + b, 0) / weekHighs.length);
    const avgLow = Math.round(weekLows.reduce((a, b) => a + b, 0) / weekLows.length);
    const totalPrecip = weekPrecip.reduce((a, b) => a + b, 0);
    const rainyDays = (d.weathercode || []).filter(c => c >= 51).length;

    return {
      today: {
        icon, temp: `${high}°F / ${low}°F`, desc,
        detail: `Precip: ${this._formatPrecip(precip)} in · Historical data for ${targetDate}`,
        high, low,
      },
      week: {
        icon: '🗓️', temp: `${avgHigh}°F / ${avgLow}°F avg`,
        desc: `${rainyDays} rainy day${rainyDays !== 1 ? 's' : ''} recorded`,
        detail: `Total precip: ${this._formatPrecip(totalPrecip)} in · ${weekHighs.length} days of data`,
      },
      month: {
        icon: '📊', temp: `${avgHigh}°F / ${avgLow}°F avg`,
        desc: 'Based on historical data',
        detail: `Total precip: ${this._formatPrecip(totalPrecip)} in (${weekHighs.length}-day window)`,
      },
      avgTemp: (high + low) / 2,
      isFrosty: low <= 32,
      isHot: high >= 90,
    };
  },

  _climateEstimate(lat, month) {
    // Very rough climate averages by month (US-centric, temperate)
    const temps = {
      1: [42, 25], 2: [48, 28], 3: [58, 35], 4: [68, 45],
      5: [76, 54], 6: [84, 63], 7: [88, 67], 8: [86, 66],
      9: [80, 58], 10: [69, 47], 11: [56, 36], 12: [45, 28]
    };
    const precips = {
      1: 2.5, 2: 2.3, 3: 3.1, 4: 3.5, 5: 4.2, 6: 3.8,
      7: 3.5, 8: 3.2, 9: 3.8, 10: 3.4, 11: 2.8, 12: 2.6
    };
    const [h, l] = temps[month] || [70, 50];
    const p = precips[month] || 3.0;
    return {
      today: {
        icon: '📅', temp: `~${h}°F / ~${l}°F`, desc: 'Climate average (estimated)',
        detail: `Avg monthly precip: ~${p.toFixed(2)} in · Beyond forecast range`, high: h, low: l,
      },
      week: { icon: '🗓️', temp: `~${h}°F / ~${l}°F avg`, desc: 'Seasonal estimate', detail: `Avg precip: ~${(p / 4).toFixed(2)} in/week` },
      month: { icon: '📊', temp: `~${h}°F / ~${l}°F avg`, desc: 'Seasonal estimate', detail: `Avg monthly precip: ~${p.toFixed(2)} in` },
      avgTemp: (h + l) / 2, isFrosty: l <= 32, isHot: h >= 90,
    };
  },

  _addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }
};
