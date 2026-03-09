"use client"

import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip } from "recharts"

interface ChartPoint {
  hour: string
  temp: number
  isCurrent: boolean
}

interface TempChartProps {
  points: ChartPoint[]
  unitSymbol: string
}

function CustomTooltip(props: Record<string, unknown>) {
  const { active, payload } = props as {
    active?: boolean
    payload?: Array<{ payload: ChartPoint }>
  }
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg bg-popover border px-2.5 py-1.5 text-xs shadow-lg">
      <p className="text-muted-foreground">{d.hour}</p>
      <p className="font-semibold text-foreground">{d.temp}°</p>
    </div>
  )
}

export function TempChart({ points, unitSymbol: _ }: TempChartProps) {
  const currentIndex = points.findIndex((p) => p.isCurrent)
  const currentHour = currentIndex >= 0 ? points[currentIndex].hour : null

  return (
    <div className="w-full h-24 -mb-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {currentHour && (
            <ReferenceLine
              x={currentHour}
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="temp"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#tempGradient)"
            dot={false}
            activeDot={{ r: 3, fill: "hsl(var(--primary))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
