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

    // Open-Meteo forecast covers 16 days. For dates further out, we use
    // climate normals or show an estimate.
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    const isForecastRange = diffDays >= 0 && diffDays <= 15;
    const isPast = diffDays < 0 && diffDays >= -92;

    let result;
    if (isForecastRange) {
      result = await this._fetchForecast(lat, lng, targetDate);
    } else if (isPast) {
      result = await this._fetchHistorical(lat, lng, targetDate);
    } else {
      // Beyond range — use climate averages
      result = this._climateEstimate(lat, target.getMonth() + 1);
    }

    return result;
  },

  async _fetchForecast(lat, lng, targetDate) {
    const endDate = this._addDays(targetDate, 15);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max` +
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

    // Today's weather
    const todayWeather = {
      high: Math.round(d.temperature_2m_max[idx]),
      low: Math.round(d.temperature_2m_min[idx]),
      precip: d.precipitation_sum[idx]?.toFixed(2) || '0.00',
      wind: Math.round(d.windspeed_10m_max[idx] || 0),
      code: d.weathercode[idx] || 0,
    };
    const [todayIcon, todayDesc] = this.WMO_CODES[todayWeather.code] || ['🌡️', 'Unknown'];

    // Week summary (next 7 days from target)
    const weekEnd = Math.min(idx + 7, dates.length);
    const weekHighs = d.temperature_2m_max.slice(idx, weekEnd);
    const weekLows = d.temperature_2m_min.slice(idx, weekEnd);
    const weekPrecip = d.precipitation_sum.slice(idx, weekEnd);
    const weekCodes = d.weathercode.slice(idx, weekEnd);
    const avgHigh = Math.round(weekHighs.reduce((a, b) => a + b, 0) / weekHighs.length);
    const avgLow = Math.round(weekLows.reduce((a, b) => a + b, 0) / weekLows.length);
    const totalPrecip = weekPrecip.reduce((a, b) => a + (b || 0), 0).toFixed(2);
    const rainyDays = weekCodes.filter(c => c >= 51).length;

    // Month estimate (extrapolate from available data)
    const allHighs = d.temperature_2m_max;
    const allLows = d.temperature_2m_min;
    const monthHigh = Math.round(allHighs.reduce((a, b) => a + b, 0) / allHighs.length);
    const monthLow = Math.round(allLows.reduce((a, b) => a + b, 0) / allLows.length);
    const monthPrecip = d.precipitation_sum.reduce((a, b) => a + (b || 0), 0).toFixed(2);

    return {
      today: {
        icon: todayIcon,
        temp: `${todayWeather.high}°F / ${todayWeather.low}°F`,
        desc: todayDesc,
        detail: `Precip: ${todayWeather.precip} in · Wind: ${todayWeather.wind} mph`,
        high: todayWeather.high,
        low: todayWeather.low,
      },
      week: {
        icon: '🗓️',
        temp: `${avgHigh}°F / ${avgLow}°F avg`,
        desc: `${rainyDays} rainy day${rainyDays !== 1 ? 's' : ''} expected`,
        detail: `Total precip: ${totalPrecip} in · ${weekHighs.length}-day forecast`,
      },
      month: {
        icon: '📊',
        temp: `${monthHigh}°F / ${monthLow}°F avg`,
        desc: `Based on ${allHighs.length}-day forecast window`,
        detail: `Total precip: ${monthPrecip} in`,
      },
      // Raw for plant logic
      avgTemp: (todayWeather.high + todayWeather.low) / 2,
      isFrosty: todayWeather.low <= 32,
      isHot: todayWeather.high >= 90,
    };
  },

  _parseHistorical(data, targetDate) {
    const d = data.daily;
    if (!d || !d.time || d.time.length === 0) {
      return this._climateEstimate(0, new Date(targetDate).getMonth() + 1);
    }

    const high = Math.round(d.temperature_2m_max[0] || 70);
    const low = Math.round(d.temperature_2m_min[0] || 50);
    const code = d.weathercode?.[0] || 0;
    const [icon, desc] = this.WMO_CODES[code] || ['🌡️', 'Unknown'];

    const weekHighs = d.temperature_2m_max;
    const weekLows = d.temperature_2m_min;
    const avgHigh = Math.round(weekHighs.reduce((a, b) => a + b, 0) / weekHighs.length);
    const avgLow = Math.round(weekLows.reduce((a, b) => a + b, 0) / weekLows.length);

    return {
      today: {
        icon, temp: `${high}°F / ${low}°F`, desc,
        detail: `Historical data for ${targetDate}`,
        high, low,
      },
      week: {
        icon: '🗓️', temp: `${avgHigh}°F / ${avgLow}°F avg`,
        desc: 'Historical week average', detail: `${weekHighs.length} days of data`,
      },
      month: {
        icon: '📊', temp: `${avgHigh}°F / ${avgLow}°F avg`,
        desc: 'Based on historical data', detail: '',
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
    const [h, l] = temps[month] || [70, 50];
    return {
      today: {
        icon: '📅', temp: `~${h}°F / ~${l}°F`, desc: 'Climate average (estimated)',
        detail: 'Beyond forecast range — using seasonal norms', high: h, low: l,
      },
      week: { icon: '🗓️', temp: `~${h}°F / ~${l}°F avg`, desc: 'Seasonal estimate', detail: '' },
      month: { icon: '📊', temp: `~${h}°F / ~${l}°F avg`, desc: 'Seasonal estimate', detail: '' },
      avgTemp: (h + l) / 2, isFrosty: l <= 32, isHot: h >= 90,
    };
  },

  _addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }
};
