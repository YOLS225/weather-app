"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Trash2, RotateCcw } from "lucide-react"
import { useWeatherStore, type TemperatureUnit, type WindUnit, type PressureUnit } from "@/core/stores/weather.store"
import { cn } from "@/lib/utils"

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

// --- Sub-components ---

function Section({ title, description, children }: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

function ThemeOption({ value, current, label, icon, onSelect }: {
  value: string
  current?: string
  label: string
  icon: React.ReactNode
  onSelect: (v: string) => void
}) {
  const isActive = current === value
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
        isActive
          ? "border-primary bg-primary/5 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function UnitRow<T extends string>({ label, options, current, onChange }: {
  label: string
  options: { value: T; label: string }[]
  current: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium shrink-0">{label}</span>
      <div className="flex rounded-lg border overflow-hidden text-xs font-medium">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-2 transition-colors",
              current === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function DangerRow({ icon, label, description, buttonLabel, disabled, onClick }: {
  icon: React.ReactNode
  label: string
  description: string
  buttonLabel: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-muted-foreground mt-0.5">{icon}</span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
