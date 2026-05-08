"use client"

import { useEffect, useState } from "react"
import { Zap, RefreshCw, TrendingDown } from "lucide-react"

interface CreditsData {
  credits: number
  creditsUsed: number
  plan: string
  resetDate: string
  costs: Record<string, number>
}

export default function CreditsWidget() {
  const [data, setData] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/credits")
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCredits() }, [])

  if (loading) return (
    <div className="skeleton h-10 w-32 rounded-lg" />
  )

  if (!data) return null

  const total = data.credits + data.creditsUsed
  const pct = Math.round((data.credits / total) * 100)
  const isLow = data.credits <= 3
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(data.resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm
          ${isLow
            ? "bg-error/10 border-error/30 text-error"
            : "bg-base-200 border-base-300 text-base-content hover:bg-base-300"
          }`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span className="font-semibold">{data.credits}</span>
        <span className="text-xs opacity-60">credits</span>
      </button>

      {showDetails && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDetails(false)} />
          <div className="absolute right-0 top-12 z-50 w-72 bg-base-100 rounded-2xl border border-base-300 shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base-content">Credits</h3>
              <span className={`badge badge-sm capitalize ${data.plan === "pro" ? "badge-primary" : "badge-ghost"}`}>
                {data.plan}
              </span>
            </div>

            {/* Credit bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-base-content/60">Remaining</span>
                <span className="font-medium text-base-content">{data.credits} / {total}</span>
              </div>
              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isLow ? "bg-error" : pct > 50 ? "bg-success" : "bg-warning"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-base-content/40">
                <RefreshCw className="w-3 h-3" />
                <span>Resets in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="border-t border-base-300 pt-3">
              <p className="text-xs font-medium text-base-content/60 mb-2 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Credit costs per operation
              </p>
              <div className="space-y-1">
                {Object.entries(data.costs).map(([op, cost]) => (
                  <div key={op} className="flex justify-between text-xs">
                    <span className="text-base-content/60 capitalize">
                      {op.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-medium text-base-content flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5" />{cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isLow && (
              <div className="mt-4 p-3 bg-error/10 rounded-xl border border-error/20">
                <p className="text-xs text-error font-medium">Running low on credits!</p>
                <p className="text-xs text-error/70 mt-0.5">Credits reset in {daysLeft} days.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}