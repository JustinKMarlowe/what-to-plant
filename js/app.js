/**
 * app.js
 * Main application controller.
 * Orchestrates geolocation → weather → hardiness → plant lookup → rendering.
 */

const app = {

  state: {
    lat: null,
    lng: null,
    locationName: '',
    zone: null,
    zoneLabel: '',
    weather: null,
    targetDate: null,
    currentFilter: 'all',
  },

  // ===== ENTRY POINTS =====

  /** "What Should I Plant?" button — uses today's date */
  async start() {
    const today = new Date().toISOString().split('T')[0];
    this.state.targetDate = today;
    await this._run();
  },

  /** "Show Plants for This Date" button */
  async startWithDate() {
    const input = document.getElementById('custom-date');
    if (!input.value) {
      alert('Please select a date first.');
      return;
    }
    this.state.targetDate = input.value;
    await this._run();
  },

  /** Reset to hero screen */
  reset() {
    this._show('hero');
    this.state.currentFilter = 'all';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ===== MAIN PIPELINE =====

  async _run() {
    this._show('loading');
    this._status('Detecting your location…');

    try {
      // 1. Geolocation
      const pos = await this._getLocation();
      this.state.lat = pos.lat;
      this.state.lng = pos.lng;
      this._status('Getting location name…');

      // 2. Reverse geocode for display name
      this.state.locationName = await this._reverseGeocode(pos.lat, pos.lng);
      this._status('Looking up your hardiness zone…');

      // 3. Hardiness zone
      const hz = await HardinessZone.lookup(pos.lat, pos.lng);
      this.state.zone = hz.zone;
      this.state.zoneLabel = hz.label;
      this._status('Fetching weather data…');

      // 4. Weather
      this.state.weather = await Weather.fetch(pos.lat, pos.lng, this.state.targetDate);
      this._status('Finding the best plants for you…');

      // 5. Render
      await this._sleep(400); // Brief pause so user sees the message
      this._renderResults();
      this._show('results');
      document.getElementById('scroll-hint').style.display = 'block';

    } catch (err) {
      console.error(err);
      document.getElementById('error-message').textContent = err.message || 'An unknown error occurred.';
      this._show('error');
    }
  },

  // ===== GEOLOCATION =====

  _getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              reject(new Error('Location permission denied. Please allow location access and try again.'));
              break;
            case err.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable.'));
              break;
            case err.TIMEOUT:
              reject(new Error('Location request timed out. Please try again.'));
              break;
            default:
              reject(new Error('An unknown geolocation error occurred.'));
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
  },

  // ===== REVERSE GEOCODE =====

  async _reverseGeocode(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;
      const resp = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(5000)
      });
      const data = await resp.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const state = addr.state || '';
      const country = addr.country_code?.toUpperCase() || '';
      return [city, state, country].filter(Boolean).join(', ');
    } catch {
      return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    }
  },

  // ===== RENDERING =====

  _renderResults() {
    const { locationName, zoneLabel, weather, targetDate, zone } = this.state;
    const month = new Date(targetDate + 'T00:00:00').getMonth() + 1;
    const dateObj = new Date(targetDate + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Header badges
    document.getElementById('loc-text').textContent = locationName;
    document.getElementById('zone-value').textContent = zoneLabel;
    document.getElementById('date-text').textContent = dateStr;

    // Weather cards
    this._fillWeatherCard('today', weather.today);
    this._fillWeatherCard('week', weather.week);
    this._fillWeatherCard('month', weather.month);

    // Plants
    this._renderPlants(zone, month, this.state.currentFilter);

    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.state.currentFilter);
    });
  },

  _fillWeatherCard(period, data) {
    document.getElementById(`w-icon-${period}`).textContent = data.icon;
    document.getElementById(`w-temp-${period}`).textContent = data.temp;
    document.getElementById(`w-desc-${period}`).textContent = data.desc;
    document.getElementById(`w-detail-${period}`).textContent = data.detail;
  },

  _renderPlants(zone, month, filter) {
    const container = document.getElementById('plants-container');
    const grouped = getPlantsForConditions(zone, month, filter);

    if (Object.keys(grouped).length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 3rem 1rem;">
          <h2 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--bark); margin-bottom: 0.75rem;">
            No plants found for these conditions
          </h2>
          <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto;">
            Try a different date or filter. This could mean it's an off-season month for your hardiness zone (${zone}).
            Many plants have specific planting windows — try spring or early fall dates.
          </p>
        </div>`;
      return;
    }

    let html = '';
    for (const [soilKey, plants] of Object.entries(grouped)) {
      const soil = SOIL_TYPES[soilKey];
      html += `
        <div class="soil-section" data-soil="${soilKey}">
          <div class="soil-section-header">
            <div class="soil-icon ${soilKey}-soil">${soil.icon}</div>
            <div>
              <h2>${soil.name}</h2>
              <p style="font-size:0.85rem; color: var(--text-muted); margin:0;">${soil.desc}</p>
            </div>
          </div>
          <div class="plant-grid">
            ${plants.map((p, i) => this._plantCard(p, i)).join('')}
          </div>
        </div>`;
    }
    container.innerHTML = html;
  },

  _plantCard(plant, index) {
    const badge = plant.type === 'edible'
      ? '<span class="plant-type-badge edible">🥬 Edible</span>'
      : '<span class="plant-type-badge ornamental">🌸 Ornamental</span>';

    const aliases = plant.commonNames.length > 1
      ? `Also known as: ${plant.commonNames.slice(1).join(', ')}`
      : '';

    return `
      <div class="plant-card" style="animation-delay: ${index * 0.08}s">
        <img class="plant-card-img"
             src="${plant.image}"
             alt="${plant.name}"
             loading="lazy"
             referrerpolicy="no-referrer"
             crossorigin="anonymous"
             onerror="this.onerror=null;this.referrerPolicy='no-referrer';this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 200%22><rect fill=%22%23e8d5b7%22 width=%22400%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22>🌱</text></svg>'" />
        <div class="plant-card-body">
          ${badge}
          <h3>${plant.name}</h3>
          <p class="plant-scientific">${plant.scientificName}</p>
          ${aliases ? `<p class="plant-aliases">${aliases}</p>` : ''}

          <div class="plant-info-grid">
            <div class="plant-info-item">
              <div class="plant-info-label">💧 Watering</div>
              <div class="plant-info-value">${plant.watering}</div>
            </div>
            <div class="plant-info-item">
              <div class="plant-info-label">🌱 Seed Depth</div>
              <div class="plant-info-value">${plant.seedDepth}</div>
            </div>
            <div class="plant-info-item">
              <div class="plant-info-label">🗓️ Planting Months</div>
              <div class="plant-info-value">${plant.plantingMonths.map(m => this._monthName(m)).join(', ')}</div>
            </div>
            <div class="plant-info-item">
              <div class="plant-info-label">🌡️ Zones</div>
              <div class="plant-info-value">${plant.zones[0]}–${plant.zones[1]}</div>
            </div>
          </div>

          <div class="plant-mistakes">
            <div class="plant-mistakes-title">⚠️ Common Mistakes to Avoid</div>
            <p>${plant.mistakes}</p>
          </div>
        </div>
      </div>`;
  },

  // ===== FILTERING =====

  filterPlants(filter) {
    this.state.currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    const month = new Date(this.state.targetDate + 'T00:00:00').getMonth() + 1;
    this._renderPlants(this.state.zone, month, filter);
  },

  // ===== UTILITIES =====

  _show(section) {
    ['hero', 'loading-section', 'results-section', 'error-section'].forEach(id => {
      document.getElementById(id).classList.toggle('hidden', id !== section && id !== section + '-section');
    });
    // Fix: section IDs don't have '-section' suffix for hero
    document.getElementById('hero').classList.toggle('hidden', section !== 'hero');
    document.getElementById('loading-section').classList.toggle('hidden', section !== 'loading');
    document.getElementById('results-section').classList.toggle('hidden', section !== 'results');
    document.getElementById('error-section').classList.toggle('hidden', section !== 'error');
  },

  _status(msg) {
    document.getElementById('loader-status').textContent = msg;
  },

  _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  _monthName(num) {
    const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[num] || '?';
  }
};

// Set default date picker value to today
document.addEventListener('DOMContentLoaded', () => {
  const dp = document.getElementById('custom-date');
  dp.value = new Date().toISOString().split('T')[0];
});
