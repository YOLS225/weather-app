"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Cloud, MapIcon, BarChart2, Star, Settings, Sun, Moon } from "lucide-react"
import { SearchBar } from "@/core/components/widgets/search-bar"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Météo", icon: Cloud },
  { href: "/map", label: "Carte", icon: MapIcon },
  { href: "/charts", label: "Graphiques", icon: BarChart2 },
  { href: "/favorites", label: "Favoris", icon: Star },
  { href: "/settings", label: "Paramètres", icon: Settings },
]

export function Header() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-screen-xl px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/public" className="flex items-center gap-2 font-semibold text-lg shrink-0">
          <Cloud className="size-5 text-sky-500" />
          <span className="hidden sm:inline">Nimbus</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          title={isDark ? "Mode clair" : "Mode sombre"}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
