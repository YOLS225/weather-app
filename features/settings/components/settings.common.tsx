import { cn } from "@/lib/utils"

export function Section({ title, description, children }: {
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

export function ThemeOption({ value, current, label, icon, onSelect }: {
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

export function UnitRow<T extends string>({ label, options, current, onChange }: {
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

export function DangerRow({ icon, label, description, buttonLabel, disabled, onClick }: {
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