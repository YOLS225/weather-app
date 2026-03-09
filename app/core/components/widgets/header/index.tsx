"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Cloud, MapIcon, BarChart2, Star, Settings } from "lucide-react"
import { SearchBar } from "@/app/core/components/widgets/search-bar"
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

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-screen-xl px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg shrink-0">
          <Cloud className="size-5 text-sky-500" />
          <span>Nimbus</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
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
