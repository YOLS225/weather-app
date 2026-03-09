# Nimbus — Application Météo Web

Application météo web moderne, immersive et premium, construite avec Next.js et l'API Open-Meteo (open source, sans clé API).

## Stack technique

- **Framework** : Next.js (App Router)
- **UI** : shadcn/ui + Tailwind CSS (Glassmorphism)
- **State** : Zustand
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts
- **Maps** : Leaflet
- **Animations** : Lottie / SVG animés
- **API** : Open-Meteo (météo) + Open-Meteo Geocoding (villes)

---

## Vision produit

Entre la sophistication de *Carrot Weather* et la clarté de *Weather.com*, avec une touche data-visualisation façon *Windy.com*. L'utilisateur doit **ressentir** la météo en regardant l'interface.

**Design** : Glassmorphism · Palette adaptative selon la météo · Typographie XXL pour la température · Icônes animées · Responsive desktop/tablet/mobile

---

## Architecture des écrans

### 1. Dashboard principal (`/`)
- Hero immersif avec fond dynamique selon la météo (bleu soleil, gris orage, violet nuit)
- Température XXL + icône animée WMO + ressenti + description
- Données rapides : humidité · vent · visibilité · ressenti
- Prévisions horaires 24h/48h (scroll horizontal + mini graphique température)
- Prévisions 16 jours (expandable pour les 3 premiers)
- Grille de widgets : lever/coucher soleil · vent · pression · humidité · UV · visibilité

### 2. Carte interactive (`/map`)
- Carte plein écran (Leaflet)
- Layers : précipitations · température · vent (flux animés) · couverture nuageuse
- Tooltip météo au survol · Panel latéral rétractable

### 3. Graphiques & Analyse (`/charts`)
- Courbe température · Barres précipitations · Area chart vent
- Sélecteur période : 24h / 3j / 7j / 14j
- Comparateur multi-villes

### 4. Favoris & Multi-villes (`/favorites`)
- Grille de cards villes sauvegardées
- Drag & drop · Épingler une ville principale

### 5. Paramètres (`/settings`)
- Unités (°C/°F, km/h/mph, hPa/mmHg)
- Langue · Thème (clair/sombre/auto) · Notifications · Ville par défaut

---

## Données Open-Meteo utilisées

| Catégorie | Données |
|-----------|---------|
| Températures | Actuelle, ressentie, min/max, horaire à 2m |
| Précipitations | mm horaire/journalier, probabilité %, humidité, point de rosée |
| Vent | Vitesse, rafales, direction (degrés + cardinal) |
| Ensoleillement | Durée, rayonnement W/m², indice UV, lever/coucher soleil & lune |
| Atmosphère | Visibilité, pression hPa, couverture nuageuse % |
| Neige | Hauteur cm, précipitations cm/h, CAPE (indicateur orages) |
| Prévisions | Horaires 7j · Journalières 16j · Codes WMO |
| Géoloc | Geocoding API : nom ville → lat/lon/timezone/altitude |

---

## États UI à gérer

- Loading skeleton
- Erreur de géolocalisation
- Ville non trouvée
- Mode hors ligne

---

## Démarrage

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)