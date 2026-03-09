import type { ReactNode } from "react"
import { Header } from "@/core/components/widgets/header"
import { BottomNav } from "@/core/components/widgets/bottom-nav"

interface AppLayoutProps {
  children: ReactNode
  fullscreen?: boolean
}

export function AppLayout({ children, fullscreen }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={fullscreen
        ? "px-4 py-4 pb-[calc(1rem+5rem)] md:pb-4"
        : "mx-auto max-w-screen-xl px-4 py-6 pb-[calc(1.5rem+5rem)] md:pb-6"
      }>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
