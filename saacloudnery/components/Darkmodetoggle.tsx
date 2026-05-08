"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme") as "light" | "dark" | null
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const initial = saved || preferred
    setTheme(initial)
    document.documentElement.setAttribute("data-theme", initial === "dark" ? "night" : "light")
  }, [])

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    localStorage.setItem("theme", next)
    // DaisyUI uses data-theme on <html>
    // "night" is DaisyUI's built-in dark theme; swap to your preferred dark theme name
    document.documentElement.setAttribute("data-theme", next === "dark" ? "night" : "light")
  }

  if (!mounted) return <div className="btn btn-ghost btn-circle btn-sm skeleton" />

  return (
    <button
      onClick={toggle}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark"
        ? <Sun className="w-4 h-4 text-base-content" />
        : <Moon className="w-4 h-4 text-base-content" />
      }
    </button>
  )
}