# Nimbus — Application Météo Web

Application météo web moderne, immersive et premium, construite avec Next.js et l'API Open-Meteo (open source, sans clé API).

## Stack technique

- **Framework** : Next.js 16 (App Router)
- **UI** : shadcn/ui + Tailwind CSS v4
- **State** : Zustand (persisté localStorage)
- **Charts** : Recharts
- **Maps** : Leaflet + react-leaflet
- **API météo** : Open-Meteo (forecast + geocoding)
- **Reverse geocoding** : Nominatim (OpenStreetMap)
- **Radar précipitations** : RainViewer (tiles temps réel)

---

## Vision produit

Entre la sophistication de *Carrot Weather* et la clarté de *Weather.com*, avec une touche data-visualisation façon *Windy.com*. L'utilisateur doit **ressentir** la météo en regardant l'interface.

**Design** : Palette dynamique selon la météo et le jour/nuit · Typographie XXL pour la température · Responsive desktop/tablet/mobile · Navigation mobile bottom nav

---

## Architecture

```
app/
├── core/
│   ├── components/widgets/
│   │   ├── layout/        → AppLayout (header + main + bottom nav)
│   │   ├── header/        → Nav, search, toggle thème, logo
│   │   ├── search-bar/    → Autocomplete + géoloc GPS
│   │   ├── bottom-nav/    → Navigation mobile fixe (md:hidden)
│   │   └── weather-icon/  → Icônes SVG animées (Sun/Moon/Cloud/Rain/Storm/Snow/Fog)
│   ├── services/
│   │   ├── weather.service.ts     → Open-Meteo forecast API
│   │   ├── geocoding.service.ts   → Recherche de villes
│   │   └── geolocation.service.ts → GPS + reverse geocoding Nominatim
│   ├── stores/
│   │   └── weather.store.ts       → Zustand (ville, unités, favoris)
│   └── utils/
│       ├── constants.ts       → URLs + paramètres API
│       ├── wmo-codes.ts       → Codes WMO → labels + gradients
│       ├── api-fetch.ts       → Wrapper fetch (repeated params)
│       └── weather-helpers.ts → Formatters (vent, visibilité, UV…)
│
├── features/
│   ├── dashboard/    → Page principale
│   ├── map/          → Carte interactive Leaflet
│   ├── charts/       → Graphiques & analyse Recharts
│   ├── favorites/    → Multi-villes
│   └── settings/     → Paramètres
│
hooks/
├── use-weather.ts       → Fetch météo ville active
└── use-city-weather.ts  → Fetch météo par ville (favoris)
```

---

## Fonctionnalités

### Dashboard (`/`)
- **Géolocalisation automatique** au chargement (GPS → Nominatim reverse geocode)
- **Hero immersif** : fond dégradé dynamique selon code WMO + jour/nuit (8 combinaisons), blobs animés, horloge en temps réel
- **Température XXL** + icône SVG animée + description française + ressenti
- **4 stats rapides** : humidité · vent + direction cardinale · visibilité · ressenti
- **Prévisions horaires** : slider 24h/48h, graphique Recharts (AreaChart + tooltip + ligne courante)
- **Prévisions 16 jours** : barre Tmin→Tmax relative (gradient froid→chaud), 3 premiers jours expandables avec détail horaire
- **Widgets détails** (grille 2×3) :
  - Lever/coucher soleil avec arc SVG animé
  - Vent : vitesse + direction + rafales
  - Pression hPa + tendance (↗↘→)
  - Humidité + barre de progression
  - Indice UV max + barre segmentée colorée
  - Visibilité + couverture nuageuse

### Carte interactive (`/map`)
- Carte plein écran Leaflet (import dynamique SSR disabled)
- **Radar précipitations** en temps réel via RainViewer
- Marqueurs des villes favorites avec popup météo
- **Clic n'importe où** sur la carte → panel latéral avec météo locale (reverse geocoding Nominatim)
- Panel rétractable avec icône animée, température, stats, min/max du jour
- Bouton "Voir la météo complète" pour définir comme ville active

### Graphiques & Analyse (`/charts`)
- **3 graphiques Recharts interactifs** : température (AreaChart), précipitations (BarChart), vitesse du vent (AreaChart)
- **Sélecteur de période** : 24h / 3j / 7j / 14j
- **Comparateur de villes** : ajout d'une 2e ville pour superposer les courbes

### Favoris (`/favorites`)
- Recherche et ajout de villes
- Cards avec météo en temps réel (température, icône animée, Tmin/Tmax, heure locale)
- **Drag & drop** HTML5 natif pour réordonner
- Épingler une ville comme principale
- Bouton ⭐ dans le Hero pour ajouter/retirer la ville active

### Paramètres (`/settings`)
- **Thème** : Clair / Sombre / Système (next-themes)
- **Unités** : °C/°F · km/h/mph · hPa/mmHg
- Réinitialisation des favoris et paramètres

### Global
- Toggle thème dans le header
- Recherche avec autocomplétion (debounce 300ms)
- **Navigation mobile** : bottom nav fixe avec safe-area-inset pour iOS
- **Icônes météo SVG animées** : soleil tournant, lune avec halo, nuages flottants, pluie, orage, neige, brouillard
- États UI complets : skeleton loading · erreur API · erreur géoloc · ville vide

---

## Démarrage

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

> **Note** : L'app demande la permission de géolocalisation au premier chargement. Si refusée, utilisez la barre de recherche dans le header.