import type { ReactNode } from "react"
import { Header } from "@/app/core/components/widgets/header"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-screen-xl px-4 py-6">{children}</main>
    </div>
  )
}
