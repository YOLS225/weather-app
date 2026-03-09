# Nimbus — Application Météo Web

Application météo web moderne, immersive et premium, construite avec Next.js et l'API Open-Meteo (open source, sans clé API).

## Stack technique

- **Framework** : Next.js 16 (App Router)
- **UI** : shadcn/ui + Tailwind CSS v4
- **State** : Zustand (persisté localStorage)
- **Charts** : Recharts
- **Maps** : Leaflet *(à venir)*
- **API météo** : Open-Meteo (forecast + geocoding)
- **Reverse geocoding** : Nominatim (OpenStreetMap)

---

## Vision produit

Entre la sophistication de *Carrot Weather* et la clarté de *Weather.com*, avec une touche data-visualisation façon *Windy.com*. L'utilisateur doit **ressentir** la météo en regardant l'interface.

**Design** : Palette dynamique selon la météo et le jour/nuit · Typographie XXL pour la température · Responsive desktop/tablet/mobile

---

## Architecture

```
app/
├── core/
│   ├── components/widgets/
│   │   ├── layout/        → AppLayout (header + main)
│   │   ├── header/        → Nav, search, toggle thème
│   │   └── search-bar/    → Autocomplete + géoloc GPS
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
│   ├── dashboard/    → Page principale ✅
│   ├── map/          → Carte interactive 🚧
│   ├── charts/       → Graphiques & analyse 🚧
│   ├── favorites/    → Multi-villes ✅
│   └── settings/     → Paramètres ✅
│
hooks/
├── use-weather.ts       → Fetch météo ville active
└── use-city-weather.ts  → Fetch météo par ville (favoris)
```

---

## Fonctionnalités développées ✅

### Dashboard (`/`)
- **Géolocalisation automatique** au premier chargement (GPS → Nominatim reverse geocode)
- **Hero immersif** : fond dégradé dynamique selon code WMO + jour/nuit (8 combinaisons), blobs animés
- **Température XXL** + icône météo WMO + description française + ressenti
- **4 stats rapides** : humidité · vent + direction cardinale · visibilité · ressenti
- **Prévisions horaires** : slider 24h/48h, mini graphique Recharts (AreaChart + tooltip + ligne courante), carte "Maintenant" mise en évidence
- **Prévisions 16 jours** : barre Tmin→Tmax relative (gradient froid→chaud), les 3 premiers jours expandables avec détail horaire
- **Widgets détails** (grille 2×3) :
  - Lever/coucher soleil avec arc SVG animé
  - Vent : vitesse + direction + rafales
  - Pression hPa + tendance (↗↘→)
  - Humidité + barre de progression
  - Indice UV max + barre segmentée colorée
  - Visibilité + couverture nuageuse

### Favoris (`/favorites`)
- Barre de recherche dédiée pour ajouter des villes
- Grille de cards avec météo en temps réel par ville (température, icône, Tmin/Tmax, heure locale)
- **Drag & drop** HTML5 natif pour réordonner
- Épingler une ville comme principale (badge + ring)
- Supprimer une ville
- Bouton ⭐ dans le Hero pour ajouter/retirer la ville active

### Paramètres (`/settings`)
- **Thème** : Clair / Sombre / Système (persisté)
- **Unités** : °C/°F · km/h/mph · hPa/mmHg (appliquées immédiatement)
- Ville par défaut affichée
- Supprimer tous les favoris / Réinitialiser les paramètres

### Global
- Toggle thème ☀️/🌙 dans le header
- Recherche de ville avec autocomplétion (debounce 300ms) dans le header
- États UI : skeleton loading · erreur API (message détaillé) · erreur géoloc · ville vide

---

## Reste à faire 🚧

### Carte interactive (`/map`)
- Carte plein écran Leaflet
- Layers sélectionnables : précipitations · température · vent · nuages (tiles Open-Meteo)
- Tooltip météo au clic/survol
- Panel latéral rétractable avec données de la ville pointée
- Bouton recentrage position actuelle

### Graphiques & Analyse (`/charts`)
- Graphiques Recharts interactifs :
  - Courbe température 7j
  - Barres précipitations 7j
  - Area chart vent 7j
- Sélecteur de période : 24h / 3j / 7j / 14j
- Comparateur de villes (ajouter une 2e courbe)

### Polish & UX
- Icônes météo animées (Lottie ou SVG animés) en remplacement des emojis
- Navigation mobile (bottom nav ou hamburger)
- Toggle °C/°F rapide dans le header
- Mode hors ligne (Service Worker / cache)
- Skeleton sur les widgets détails
- Animations de transition entre villes

---

## Démarrage

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

> **Note** : L'app demande la permission de géolocalisation au premier chargement. Si refusée, utilisez la barre de recherche.
