"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import {
  TrendingUp, HardDrive, Zap, Video, ArrowUpRight,
  ArrowDownRight, Clock, Scissors, Activity,
} from "lucide-react"

interface AnalyticsData {
  summary: {
    totalUploads: number
    totalStorageBytes: number
    totalTransformations: number
    totalDurationSeconds: number
    savedBytes: number
    compressionRate: number
    uploadsChange: number
    storageChange: number
  }
  uploadsByDay: { date: string; count: number }[]
  transformationsByType: { type: string; count: number }[]
  storageByDay: { date: string; bytes: number }[]
  topEffects: { effect: string; count: number }[]
}

const COLORS = ["#7F77DD", "#1D9E75", "#D85A30", "#378ADD", "#BA7517"]

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function formatDuration(seconds: number) {
  if (!seconds) return "0s"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${Math.floor(seconds % 60)}s`
}

function StatCard({
  icon: Icon, label, value, sub, change, color,
}: {
  icon: any; label: string; value: string; sub?: string; change?: number; color: string
}) {
  const positive = change === undefined || change >= 0
  return (
    <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl" style={{ background: color + "22" }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-error"}`}>
            {positive
              ? <ArrowUpRight className="w-3 h-3" />
              : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-base-content mb-1">{value}</div>
      <div className="text-sm text-base-content/60">{label}</div>
      {sub && <div className="text-xs text-base-content/40 mt-0.5">{sub}</div>}
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center text-base-content/30 gap-2">
      <Activity className="w-8 h-8" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d")

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/analytics?range=${range}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [range])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-base-100 rounded-2xl border border-base-300 p-5 h-32 skeleton" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-base-100 rounded-2xl border border-base-300 p-6 h-72 skeleton" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="alert alert-error max-w-md">
        <span>Error: {error}</span>
      </div>
    </div>
  )

  // Show zero-state dashboard if no videos yet
  const hasData = data && data.summary.totalUploads > 0
  const hasChartData = data?.uploadsByDay.some(d => d.count > 0)
  const hasEffectsData = data && data.topEffects.length > 0
  const hasPieData = data && data.transformationsByType.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Analytics</h1>
          <p className="text-sm text-base-content/60 mt-1">
            {hasData
              ? "Your media usage at a glance"
              : "Upload some videos to see your analytics"}
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`btn btn-sm ${range === r ? "btn-primary" : "btn-ghost"}`}
            >
              {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards — always show even with zero values */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Video}
          label="Total videos"
          value={data?.summary.totalUploads?.toString() || "0"}
          change={data?.summary.uploadsChange}
          color="#7F77DD"
        />
        <StatCard
          icon={HardDrive}
          label="Storage used"
          value={formatBytes(data?.summary.totalStorageBytes || 0)}
          color="#1D9E75"
        />
        <StatCard
          icon={Scissors}
          label="Space saved"
          value={formatBytes(data?.summary.savedBytes || 0)}
          sub={data?.summary.compressionRate ? `${data.summary.compressionRate}% compression` : undefined}
          color="#D85A30"
        />
        <StatCard
          icon={Clock}
          label="Total duration"
          value={formatDuration(data?.summary.totalDurationSeconds || 0)}
          color="#378ADD"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Uploads over time */}
        <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-base-content">Uploads over time</h2>
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data!.uploadsByDay} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  opacity={0.3}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  opacity={0.3}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--b1)",
                    border: "1px solid var(--b3)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#7F77DD" radius={[4, 4, 0, 0]} name="Uploads" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No uploads in this period yet" />
          )}
        </div>

        {/* Storage growth */}
        <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
          <div className="flex items-center gap-2 mb-5">
            <HardDrive className="w-4 h-4 text-success" />
            <h2 className="font-semibold text-base-content">Storage over time</h2>
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data!.storageByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  opacity={0.3}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  opacity={0.3}
                  tickFormatter={v => formatBytes(v)}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--b1)",
                    border: "1px solid var(--b3)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatBytes(v), "Storage"]}
                />
                <Line
                  type="monotone"
                  dataKey="bytes"
                  stroke="#1D9E75"
                  strokeWidth={2}
                  dot={false}
                  name="Storage"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Storage data will appear here" />
          )}
        </div>

        {/* Breakdown pie */}
        <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Video className="w-4 h-4 text-warning" />
            <h2 className="font-semibold text-base-content">Content breakdown</h2>
          </div>
          {hasPieData ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={data!.transformationsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="count"
                    stroke="none"
                  >
                    {data!.transformationsByType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--b1)",
                      border: "1px solid var(--b3)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data!.transformationsByType.map((item, i) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-base-content/70">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart message="Upload videos to see breakdown" />
          )}
        </div>

        {/* Top effects */}
        <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4 text-error" />
            <h2 className="font-semibold text-base-content">Most used effects</h2>
          </div>
          {hasEffectsData ? (
            <div className="space-y-3">
              {data!.topEffects.map((item, i) => {
                const max = data!.topEffects[0]?.count || 1
                const pct = Math.round((item.count / max) * 100)
                return (
                  <div key={item.effect}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-base-content/70 capitalize">
                        {item.effect.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-base-300 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-base-content/30 gap-2">
              <Zap className="w-8 h-8" />
              <p className="text-sm text-center">
                Apply effects via Media Effects page<br />to see usage stats here
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}