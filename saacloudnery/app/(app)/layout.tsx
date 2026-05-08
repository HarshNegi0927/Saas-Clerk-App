"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useClerk, useUser } from "@clerk/nextjs"
import {
  LogOutIcon, MenuIcon, LayoutDashboardIcon, Share2Icon,
  ImageIcon, Wand2, History, ChevronRight
} from "lucide-react"

const sidebarItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home" },
  { href: "/media-effects", icon: Wand2, label: "Media Effects" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/history", icon: History, label: "History" },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()

  const handleSignOut = async () => { await signOut() }

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="w-full bg-base-200/80 backdrop-blur-sm sticky top-0 z-30 border-b border-base-300">
          <div className="navbar max-w-7xl mx-auto px-4">
            <div className="flex-none lg:hidden">
              <label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost drawer-button">
                <MenuIcon className="w-5 h-5" />
              </label>
            </div>
            <div className="flex-1">
              <Link href="/" className="btn btn-ghost normal-case text-xl font-bold tracking-tight">
                Cloudinary Showcase
              </Link>
            </div>
            <div className="flex-none flex items-center gap-3">
              {user && (
                <>
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                      <img
                        src={user.imageUrl || "/placeholder.svg"}
                        alt={user.username || "User"}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium hidden sm:block truncate max-w-32">
                    {user.firstName || user.emailAddresses[0]?.emailAddress}
                  </span>
                  <button onClick={handleSignOut} className="btn btn-ghost btn-circle btn-sm">
                    <LogOutIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="sidebar-drawer" className="drawer-overlay" />
        <aside className="bg-base-200 w-64 h-full flex flex-col border-r border-base-300">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-base-300">
            <div className="p-1.5 bg-primary rounded-lg">
              <ImageIcon className="w-5 h-5 text-primary-content" />
            </div>
            <span className="font-bold text-base-content">CloudSaaS</span>
          </div>

          {/* Nav items */}
          <ul className="menu p-3 w-full text-base-content flex-grow gap-0.5">
            {sidebarItems.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      active
                        ? "bg-primary text-primary-content font-medium"
                        : "hover:bg-base-300 text-base-content/70 hover:text-base-content"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {active && <ChevronRight className="w-3 h-3 opacity-60" />}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* User section */}
          {user && (
            <div className="p-3 border-t border-base-300">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-base-100 mb-2">
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img src={user.imageUrl || "/placeholder.svg"} alt="User" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-base-content truncate">
                    {user.firstName || "User"}
                  </p>
                  <p className="text-xs text-base-content/50 truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="btn btn-outline btn-error btn-sm w-full gap-2"
              >
                <LogOutIcon className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}