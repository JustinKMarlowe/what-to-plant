# 🌱 What To Plant

**A personalized planting guide that tells you exactly what to plant based on your location, weather, and hardiness zone.**

One click. The site detects your location, checks real-time weather & forecasts, identifies your USDA hardiness zone, and shows you the best plants to grow — complete with pictures, scientific names, watering instructions, seed depth, and common mistakes to avoid.

🔗 **Live site:** [https://justinkmarlowe.github.io/what-to-plant](https://justinkmarlowe.github.io/what-to-plant)

---

## Features

- **One-click discovery** — Hit "Find My Plants" and everything is automatic
- **Location detection** — Uses browser geolocation + reverse geocoding
- **Real-time weather** — Current conditions, 7-day forecast, and monthly outlook via [Open-Meteo](https://open-meteo.com/)
- **USDA Hardiness Zone** — Looked up from coordinates via [phzmapi.org](https://phzmapi.org/)
- **35+ plants** in the database, both edible and ornamental
- **Grouped by soil type** — Clay, Sandy, Loam, Silty, Peaty, Chalky
- **Filter by edible or ornamental**
- **Custom date picker** — See what to plant on any date
- **Rich plant cards** with:
  - Photo from Wikimedia Commons
  - Common names & scientific name
  - Watering instructions
  - Seed planting depth
  - Planting month range & zone range
  - Common mistakes to avoid
- **No API keys required** — All APIs used are free and open
- **No build step** — Pure HTML, CSS, and vanilla JavaScript
- **Fully responsive** — Works on desktop, tablet, and mobile

---

## How It Works

```
User clicks "Find My Plants"
        │
        ▼
Browser Geolocation API → lat/lng
        │
        ├──► Nominatim reverse geocode → city, state
        ├──► phzmapi.org → USDA Hardiness Zone
        └──► Open-Meteo API → current + forecast weather
                │
                ▼
        Plant Database Filter:
        zone ∩ month ∩ soil type
                │
                ▼
        Rendered as cards grouped by soil type
```

---

## Deploying to GitHub Pages

This repository is designed to be deployed as a **GitHub Pages** site with zero configuration.

### Step 1: Upload Files to GitHub

Make sure your repository at `github.com/JustinKMarlowe/what-to-plant` contains these files:

```
what-to-plant/
├── index.html          ← Main page
├── css/
│   └── style.css       ← Stylesheet
├── js/
│   ├── app.js          ← Main app logic
│   ├── plant-database.js ← All plant data
│   ├── hardiness.js    ← Hardiness zone lookup
│   └── weather.js      ← Weather API integration
└── README.md           ← This file
```

### Step 2: Enable GitHub Pages

1. Go to your repository: `https://github.com/JustinKMarlowe/what-to-plant`
2. Click **Settings** (gear icon tab)
3. In the left sidebar, click **Pages**
4. Under **Source**, select **Deploy from a branch**
5. Under **Branch**, select `main` and folder `/ (root)`
6. Click **Save**
7. Wait 1–2 minutes, then visit: `https://justinkmarlowe.github.io/what-to-plant`

That's it! No build step, no npm, no frameworks. It just works.

---

## APIs Used (All Free, No Keys Needed)

| Service | Purpose | URL |
|---------|---------|-----|
| **Browser Geolocation** | Get user's lat/lng | Built into browser |
| **Nominatim (OpenStreetMap)** | Reverse geocode → city name | `nominatim.openstreetmap.org` |
| **phzmapi.org** | USDA Hardiness Zone lookup | `phzmapi.org` |
| **Open-Meteo** | Current weather + 16-day forecast | `api.open-meteo.com` |
| **Open-Meteo Archive** | Historical weather for past dates | `archive-api.open-meteo.com` |
| **Wikimedia Commons** | Plant photographs | `upload.wikimedia.org` |

---

## Customizing the Plant Database

All plant data lives in `js/plant-database.js`. Each plant entry looks like this:

```javascript
{
  name: "Tomato",
  scientificName: "Solanum lycopersicum",
  commonNames: ["Tomato", "Garden Tomato", "Love Apple"],
  type: "edible",                    // "edible" or "ornamental"
  zones: [3, 11],                    // USDA hardiness zone range
  plantingMonths: [3, 4, 5, 6],     // Months (1=Jan, 12=Dec)
  soilTypes: ["loamy", "sandy"],     // From: clay, sandy, loamy, silty, peaty, chalky
  watering: "1–2 inches per week...",
  seedDepth: "¼ inch deep...",
  mistakes: "Planting too early...",
  image: "https://upload.wikimedia.org/..."
}
```

To add a new plant, just add another object to the `PLANT_DB` array.

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled and location permissions for automatic detection.

---

## License

MIT License. Plant images are from Wikimedia Commons under Creative Commons licenses.
