"use client"

import { useEffect, useState } from "react"
import { History, RefreshCw, Download, Clock, ImageIcon, Video, ArrowRight, AlertTriangle, X } from "lucide-react"
import Link from "next/link"

interface HistoryItem {
  id: string
  publicId: string
  originalUrl: string
  transformedUrl: string
  effects: string[]
  mediaType: string
  createdAt: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)
  const [selected, setSelected] = useState<HistoryItem | null>(null)

  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(d => {
        setHistory(d.history || [])
        if (d.warning) setWarning(d.warning)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDownload = (url: string, id: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = `transformed_${id}`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reApply = (item: HistoryItem) => {
    const params = new URLSearchParams({
      publicId: item.publicId,
      effects: item.effects.join(","),
      mediaType: item.mediaType,
    })
    window.location.href = `/media-effects?${params}`
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton rounded-2xl h-64" />
      ))}
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-base-200 rounded-xl">
          <History className="w-5 h-5 text-base-content/70" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-base-content">Transformation history</h1>
          <p className="text-sm text-base-content/60">Re-apply any past transformation to new media</p>
        </div>
      </div>

      {/* Migration warning banner */}
      {warning && (
        <div className="alert alert-warning mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Database migration needed</p>
            <p className="text-sm mt-1 opacity-80">
              The history table doesn&apos;t exist yet. Run this command in your project folder:
            </p>
            <code className="block mt-2 text-xs bg-warning/20 rounded-lg px-3 py-2 font-mono">
              npx prisma migrate dev --name add_transformation_history
            </code>
          </div>
          <button onClick={() => setWarning(null)} className="btn btn-ghost btn-xs btn-circle flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
          <History className="w-12 h-12 mb-4" />
          <p className="font-medium text-base-content/60">No transformations yet</p>
          <p className="text-sm mt-1 mb-6">
            {warning
              ? "Run the migration above, then apply an effect to see history"
              : "Apply effects on the Media Effects page — they'll appear here"}
          </p>
          <Link href="/media-effects" className="btn btn-primary btn-sm">
            Go to Media Effects
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-base-content/60 mb-4">
            {history.length} transformation{history.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map(item => (
              <div
                key={item.id}
                className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Before / After preview */}
                <div className="grid grid-cols-2 h-36">
                  <div className="relative overflow-hidden border-r border-base-300">
                    <span className="absolute top-1.5 left-1.5 badge badge-xs bg-base-300/80 border-0 text-base-content/60 z-10">
                      Before
                    </span>
                    {item.mediaType === "video" ? (
                      <div className="w-full h-full bg-base-200 flex items-center justify-center">
                        <Video className="w-6 h-6 text-base-content/30" />
                      </div>
                    ) : (
                      <img
                        src={item.originalUrl}
                        alt="Original"
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                    )}
                  </div>
                  <div className="relative overflow-hidden">
                    <span className="absolute top-1.5 left-1.5 badge badge-xs bg-primary/80 text-primary-content border-0 z-10">
                      After
                    </span>
                    {item.mediaType === "video" ? (
                      <video src={item.transformedUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img
                        src={item.transformedUrl}
                        alt="Transformed"
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.effects.slice(0, 3).map(effect => (
                      <span key={effect} className="badge badge-ghost badge-sm text-xs capitalize">
                        {effect.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    ))}
                    {item.effects.length > 3 && (
                      <span className="badge badge-ghost badge-sm text-xs">
                        +{item.effects.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-base-content/40 mb-3">
                    <span className="flex items-center gap-1">
                      {item.mediaType === "video"
                        ? <Video className="w-3 h-3" />
                        : <ImageIcon className="w-3 h-3" />}
                      {item.mediaType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => reApply(item)}
                      className="btn btn-primary btn-sm flex-1 gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Re-apply
                    </button>
                    <button
                      onClick={() => handleDownload(item.transformedUrl, item.id)}
                      className="btn btn-ghost btn-sm border border-base-300"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSelected(item)}
                      className="btn btn-ghost btn-sm border border-base-300"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <h3 className="font-semibold">Transformation detail</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSelected(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 divide-x divide-base-300">
              <div className="p-4">
                <p className="text-xs text-base-content/60 mb-2 font-medium">Original</p>
                {selected.mediaType === "video"
                  ? <video src={selected.originalUrl} controls className="w-full rounded-lg" />
                  : <img src={selected.originalUrl} alt="Original" className="w-full rounded-lg" />
                }
              </div>
              <div className="p-4">
                <p className="text-xs text-base-content/60 mb-2 font-medium">Transformed</p>
                {selected.mediaType === "video"
                  ? <video src={selected.transformedUrl} controls className="w-full rounded-lg" />
                  : <img src={selected.transformedUrl} alt="Transformed" className="w-full rounded-lg" />
                }
              </div>
            </div>
            <div className="p-4 border-t border-base-300">
              <p className="text-xs font-medium text-base-content/60 mb-2">Effects applied:</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selected.effects.map(e => (
                  <span key={e} className="badge badge-primary badge-sm capitalize">
                    {e.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => reApply(selected)} className="btn btn-primary btn-sm flex-1">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Re-apply to new media
                </button>
                <button
                  onClick={() => handleDownload(selected.transformedUrl, selected.id)}
                  className="btn btn-ghost btn-sm border border-base-300"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}