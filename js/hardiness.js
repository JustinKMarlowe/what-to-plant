/**
 * hardiness.js
 * Determines USDA Plant Hardiness Zone from latitude/longitude
 * using the USDA PHZM API (free, no key required).
 * Falls back to a latitude-based estimation if the API is unavailable.
 */

const HardinessZone = {

  /**
   * Look up hardiness zone for given coordinates.
   * Tries USDA API first, then falls back to estimation.
   * @returns {Promise<{zone: number, label: string}>}
   */
  async lookup(lat, lng) {
    try {
      return await this._fromAPI(lat, lng);
    } catch (e) {
      console.warn('USDA API unavailable, using estimation:', e.message);
      return this._estimate(lat);
    }
  },

  /**
   * USDA PHZM API lookup
   */
  async _fromAPI(lat, lng) {
    const url = `https://phzmapi.org/${lat}/${lng}.json`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) throw new Error(`PHZM API returned ${resp.status}`);
    const data = await resp.json();
    // API returns something like { zone: "8b", ... }
    const label = data.zone || '—';
    const zone = parseInt(label, 10);
    return { zone: isNaN(zone) ? 7 : zone, label };
  },

  /**
   * Fallback: estimate zone from latitude (US-centric, rough).
   * This is a simplified model — actual zones depend on elevation,
   * proximity to water, and microclimates.
   */
  _estimate(lat) {
    const absLat = Math.abs(lat);
    let zone;
    if (absLat >= 60)      zone = 2;
    else if (absLat >= 55) zone = 3;
    else if (absLat >= 50) zone = 4;
    else if (absLat >= 45) zone = 5;
    else if (absLat >= 40) zone = 6;
    else if (absLat >= 37) zone = 7;
    else if (absLat >= 33) zone = 8;
    else if (absLat >= 29) zone = 9;
    else if (absLat >= 25) zone = 10;
    else                   zone = 11;
    return { zone, label: `~${zone} (estimated)` };
  }
};
