import type { WeatherSeverity } from "@/core/utils/wmo-codes"

interface WeatherIconProps {
  severity: WeatherSeverity
  isDay?: boolean
  size?: number
  className?: string
}

export function WeatherIcon({ severity, isDay = true, size = 64, className }: WeatherIconProps) {
  const props = { size, className }

  if (!isDay && severity === "clear") return <MoonIcon {...props} />
  if (!isDay) return <NightCloudIcon severity={severity} {...props} />

  switch (severity) {
    case "clear":   return <SunIcon {...props} />
    case "cloudy":  return <CloudIcon {...props} />
    case "rain":    return <RainIcon {...props} />
    case "storm":   return <StormIcon {...props} />
    case "snow":    return <SnowIcon {...props} />
    case "fog":     return <FogIcon {...props} />
    default:        return <CloudIcon {...props} />
  }
}

type IconProps = { size: number; className?: string }

// ---- Sun ----
function SunIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <style>{`
        @keyframes sun-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sun-pulse { 0%,100% { opacity:1; r:12; } 50% { opacity:.85; r:13; } }
        .sun-rays { animation: sun-spin 12s linear infinite; transform-origin: 32px 32px; }
        .sun-core { animation: sun-pulse 3s ease-in-out infinite; }
      `}</style>
      <g className="sun-rays">
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180
          const x1 = 32 + Math.cos(rad) * 16
          const y1 = 32 + Math.sin(rad) * 16
          const x2 = 32 + Math.cos(rad) * 26
          const y2 = 32 + Math.sin(rad) * 26
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        })}
      </g>
      <circle className="sun-core" cx="32" cy="32" r="12" fill="#fbbf24" />
      <circle cx="32" cy="32" r="9" fill="#fde68a" />
    </svg>
  )
}

// ---- Moon ----
function MoonIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <style>{`
        @keyframes star-twinkle { 0%,100% { opacity:1; } 50% { opacity:.2; } }
        .star1 { animation: star-twinkle 2s ease-in-out infinite; }
        .star2 { animation: star-twinkle 2.6s ease-in-out infinite .4s; }
        .star3 { animation: star-twinkle 1.8s ease-in-out infinite .8s; }
        @keyframes moon-glow { 0%,100% { filter: drop-shadow(0 0 4px #818cf8); } 50% { filter: drop-shadow(0 0 10px #818cf8); } }
        .moon { animation: moon-glow 4s ease-in-out infinite; }
      `}</style>
      <path className="moon" d="M38 14 A18 18 0 1 0 38 50 A12 12 0 1 1 38 14Z" fill="#c7d2fe" />
      <circle className="star1" cx="50" cy="16" r="1.5" fill="#e0e7ff" />
      <circle className="star2" cx="54" cy="28" r="1" fill="#e0e7ff" />
      <circle className="star3" cx="46" cy="10" r="1" fill="#e0e7ff" />
    </svg>
  )
}

// ---- Cloud ----
function CloudIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <style>{`
        @keyframes cloud-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-3px); } }
        .cloud-body { animation: cloud-float 4s ease-in-out infinite; }
      `}</style>
      <g className="cloud-body">
        <ellipse cx="28" cy="36" rx="18" ry="11" fill="#94a3b8" />
        <circle cx="22" cy="32" r="9" fill="#cbd5e1" />
        <circle cx="34" cy="30" r="11" fill="#cbd5e1" />
        <ellipse cx="28" cy="36" rx="16" ry="9" fill="#e2e8f0" />
      </g>
    </svg>
  )
}

// ---- Rain ----
function RainIcon({ size, className }: IconProps) {
  const drops = [
    { cx: 20, delay: "0s" }, { cx: 28, delay: "0.3s" }, { cx: 36, delay: "0.15s" }, { cx: 44, delay: "0.45s" },
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <style>{`
        @keyframes cloud-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-2px); } }
        @keyframes rain-fall { 0% { transform:translateY(0); opacity:1; } 100% { transform:translateY(14px); opacity:0; } }
        .cloud-body { animation: cloud-float 4s ease-in-out infinite; }
        .drop { animation: rain-fall 0.9s linear infinite; }
      `}</style>
      <g className="cloud-body">
        <circle cx="22" cy="26" r="8" fill="#94a3b8" />
        <circle cx="33" cy="23" r="10" fill="#94a3b8" />
        <ellipse cx="28" cy="30" rx="16" ry="8" fill="#94a3b8" />
      </g>
      {drops.map((d, i) => (
        <line
          key={i}
          className="drop"
          x1={d.cx} y1="40" x2={d.cx - 2} y2="50"
          stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"
          style={{ animationDelay: d.delay }}
        />
      ))}
    </svg>
  )
}

// ---- Storm ----
function StormIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <style>{`
        @keyframes cloud-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-2px); } }
        @keyframes lightning-flash { 0%,90%,100% { opacity:1; } 95% { opacity:.1; } }
        @keyframes rain-fall { 0% { transform:translateY(0); opacity:1; } 100% { transform:translateY(12px); opacity:0; } }
        .cloud-body { animation: cloud-float 4s ease-in-out infinite; }
        .bolt { animation: lightning-flash 2.5s ease-in-out infinite; }
        .drop { animation: rain-fall 0.9s linear infinite; }
      `}</style>
      <g className="cloud-body">
        <circle cx="22" cy="24" r="8" fill="#475569" />
        <circle cx="34" cy="21" r="10" fill="#475569" />
        <ellipse cx="28" cy="28" rx="16" ry="8" fill="#475569" />
      </g>
      <path className="bolt" d="M33 33 L27 44 L32 44 L26 55 L38 40 L33 40 Z" fill="#fbbf24" />
      <line className="drop" x1="18" y1="38" x2="16" y2="47" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: "0.2s" }} />
      <line className="drop" x1="46" y1="38" x2="44" y2="47" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: "0.5s" }} />
    </svg>
  )
}

// ---- Snow ----
function SnowIcon({ size, className }: IconProps) {
  const flakes = [
    { cx: 20, delay: "0s" }, { cx: 32, delay: "0.4s" }, { cx: 44, delay: "0.2s" },
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <style>{`
        @keyframes cloud-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-2px); } }
        @keyframes snow-fall { 0% { transform:translateY(0) rotate(0deg); opacity:1; } 100% { transform:translateY(14px) rotate(180deg); opacity:0; } }
        .cloud-body { animation: cloud-float 4s ease-in-out infinite; }
        .flake { animation: snow-fall 1.4s linear infinite; }
      `}</style>
      <g className="cloud-body">
        <circle cx="22" cy="26" r="8" fill="#94a3b8" />
        <circle cx="34" cy="23" r="10" fill="#94a3b8" />
        <ellipse cx="28" cy="30" rx="16" ry="8" fill="#bfdbfe" />
      </g>
      {flakes.map((f, i) => (
        <g key={i} className="flake" style={{ animationDelay: f.delay, transformOrigin: `${f.cx}px 47px` }}>
          <line x1={f.cx} y1="42" x2={f.cx} y2="52" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
          <line x1={f.cx - 4} y1="44" x2={f.cx + 4} y2="50" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
          <line x1={f.cx + 4} y1="44" x2={f.cx - 4} y2="50" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}

// ---- Fog ----
function FogIcon({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <style>{`
        @keyframes fog-slide { 0%,100% { transform:translateX(0); opacity:.7; } 50% { transform:translateX(4px); opacity:1; } }
        @keyframes fog-slide2 { 0%,100% { transform:translateX(0); opacity:.5; } 50% { transform:translateX(-4px); opacity:.9; } }
        .fog1 { animation: fog-slide 3s ease-in-out infinite; }
        .fog2 { animation: fog-slide2 3.5s ease-in-out infinite .5s; }
        .fog3 { animation: fog-slide 4s ease-in-out infinite 1s; }
      `}</style>
      <rect className="fog1" x="10" y="22" width="44" height="5" rx="2.5" fill="#94a3b8" />
      <rect className="fog2" x="14" y="32" width="36" height="5" rx="2.5" fill="#94a3b8" />
      <rect className="fog3" x="8" y="42" width="48" height="5" rx="2.5" fill="#94a3b8" />
    </svg>
  )
}

// ---- Night Cloud (nuageux/pluie/etc. la nuit) ----
function NightCloudIcon({ severity, size, className }: IconProps & { severity: WeatherSeverity }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <style>{`
        @keyframes cloud-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-2px); } }
        @keyframes rain-fall { 0% { transform:translateY(0); opacity:1; } 100% { transform:translateY(12px); opacity:0; } }
        .cloud-body { animation: cloud-float 4s ease-in-out infinite; }
        .drop { animation: rain-fall 0.9s linear infinite; }
      `}</style>
      {/* Mini moon */}
      <path d="M52 14 A8 8 0 1 0 52 30 A5 5 0 1 1 52 14Z" fill="#c7d2fe" opacity=".8" />
      <g className="cloud-body">
        <circle cx="24" cy="30" r="9" fill="#475569" />
        <circle cx="36" cy="27" r="11" fill="#475569" />
        <ellipse cx="30" cy="34" rx="17" ry="9" fill="#64748b" />
      </g>
      {(severity === "rain" || severity === "storm") && [20,30,40].map((cx, i) => (
        <line key={i} className="drop" x1={cx} y1="45" x2={cx - 2} y2="54"
          stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"
          style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
      {severity === "snow" && [20,30,40].map((cx, i) => (
        <circle key={i} className="drop" cx={cx} cy="48" r="2" fill="#bfdbfe"
          style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  )
}