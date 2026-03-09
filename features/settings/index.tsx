"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Trash2, RotateCcw} from "lucide-react"
import { useWeatherStore, type TemperatureUnit, type WindUnit, type PressureUnit } from "@/core/stores/weather.store"
import {
  DangerRow,
  Section,
  ThemeOption,
  UnitRow,
} from "@/features/settings/components/settings.common"

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const {
    temperatureUnit, setTemperatureUnit,
    windUnit, setWindUnit,
    pressureUnit, setPressureUnit,
    activeCity, savedCities,
    reorderCities, setActiveCity,
  } = useWeatherStore()

  const pinnedCity = savedCities.find((c) => c.isPinned) ?? null

  function handleResetAll() {
    if (!confirm("Réinitialiser tous les paramètres ?")) return
    setTemperatureUnit("celsius")
    setWindUnit("kmh")
    setPressureUnit("hPa")
    setTheme("system")
  }

  function handleClearFavorites() {
    if (!confirm("Supprimer tous les favoris ?")) return
    reorderCities([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Personnalisez votre expérience Nimbus</p>
      </div>

      {/* Top grid: Apparence + Unités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Apparence --- */}
        <Section title="Apparence" description="Choisissez le thème de l'interface">
          <div className="grid grid-cols-3 gap-3">
            <ThemeOption value="light" current={theme} label="Clair" icon={<Sun className="size-5" />} onSelect={setTheme} />
            <ThemeOption value="dark" current={theme} label="Sombre" icon={<Moon className="size-5" />} onSelect={setTheme} />
            <ThemeOption value="system" current={theme} label="Système" icon={<Monitor className="size-5" />} onSelect={setTheme} />
          </div>
        </Section>

        {/* --- Unités --- */}
        <Section title="Unités de mesure" description="Choisissez les unités affichées dans l'app">
          <div className="space-y-4">
            <UnitRow
              label="Température"
              options={[
                { value: "celsius", label: "Celsius (°C)" },
                { value: "fahrenheit", label: "Fahrenheit (°F)" },
              ] satisfies { value: TemperatureUnit; label: string }[]}
              current={temperatureUnit}
              onChange={(v) => setTemperatureUnit(v as TemperatureUnit)}
            />
            <UnitRow
              label="Vitesse du vent"
              options={[
                { value: "kmh", label: "km/h" },
                { value: "mph", label: "mph" },
              ] satisfies { value: WindUnit; label: string }[]}
              current={windUnit}
              onChange={(v) => setWindUnit(v as WindUnit)}
            />
            <UnitRow
              label="Pression"
              options={[
                { value: "hPa", label: "hPa" },
                { value: "mmHg", label: "mmHg" },
              ] satisfies { value: PressureUnit; label: string }[]}
              current={pressureUnit}
              onChange={(v) => setPressureUnit(v as PressureUnit)}
            />
          </div>
        </Section>
      </div>

      {/* Bottom grid: Ville + Données + About */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Ville par défaut --- */}
        <Section title="Ville par défaut" description="La ville chargée au démarrage de l'app">
          {activeCity ? (
            <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
              <div>
                <p className="font-medium text-sm">{activeCity.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeCity.admin1 ? `${activeCity.admin1}, ` : ""}
                  {activeCity.country}
                </p>
              </div>
              {pinnedCity && pinnedCity.id === activeCity.id && (
                <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                  Épinglée
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune ville sélectionnée. Utilisez la recherche ou la géolocalisation.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Pour changer la ville par défaut, épinglez-en une depuis la page Favoris.
          </p>
        </Section>

        {/* --- Données --- */}
        <Section title="Données & Réinitialisation" description="Gérez vos données locales">
          <div className="space-y-3">
            <DangerRow
              icon={<Trash2 className="size-4" />}
              label="Supprimer tous les favoris"
              description={`${savedCities.length} ville${savedCities.length !== 1 ? "s" : ""} sauvegardée${savedCities.length !== 1 ? "s" : ""}`}
              buttonLabel="Supprimer"
              disabled={savedCities.length === 0}
              onClick={handleClearFavorites}
            />
            <DangerRow
              icon={<RotateCcw className="size-4" />}
              label="Réinitialiser les paramètres"
              description="Remet les unités et le thème par défaut"
              buttonLabel="Réinitialiser"
              onClick={handleResetAll}
            />
          </div>
        </Section>

        {/* About */}
        <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-foreground text-base">Nimbus Weather</p>
            <p>Données météo fournies par{" "}
              <span className="font-medium text-foreground">Open-Meteo</span>
              {" "}— open source, sans clé API.
            </p>
            <p>Géocodage par{" "}
              <span className="font-medium text-foreground">Open-Meteo Geocoding</span>
              {" "}&amp;{" "}
              <span className="font-medium text-foreground">Nominatim</span>.
            </p>
          </div>
          <p className="text-xs pt-2 border-t">Built with Next.js · shadcn/ui · Zustand · Recharts</p>
        </div>
      </div>
    </div>
  )
}

