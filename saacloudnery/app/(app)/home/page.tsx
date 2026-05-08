"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, ImageIcon, Video, X, Sparkles, Tag } from "lucide-react"

interface SearchResult {
  publicId: string
  url: string
  resourceType: "image" | "video"
  title: string
  createdAt: string
  tags: string[]
  bytes?: number
  format?: string
}

const suggestions = [
  "person", "car", "dog", "cat", "food", "nature",
  "building", "sky", "water", "flower", "sport", "animal"
]

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [activeQuery, setActiveQuery] = useState("")

  // Fetch all on mount
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/smart-search?q=all`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setResults(data.results || [])
      setActiveQuery("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (q: string = query) => {
    if (!q.trim()) return fetchAll()
    setLoading(true)
    setError(null)
    setActiveQuery(q)
    try {
      const res = await fetch(`/api/smart-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Search failed")
      setResults(data.results || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery("")
    setActiveQuery("")
    fetchAll()
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-base-content">Media Library</h1>
          <span className="badge badge-primary badge-sm">Google Vision AI</span>
        </div>
        <p className="text-base-content/60 text-sm ml-12">
          All your uploaded media — search by what&apos;s <strong>inside</strong> your images using AI
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mb-6">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder='Search "dog", "car", "person", "food"...'
              className="input input-bordered w-full pl-10 pr-10"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <span className="text-xs text-base-content/40">Quick search:</span>
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); handleSearch(s) }}
              className={`badge cursor-pointer transition-colors ${
                activeQuery === s ? "badge-primary" : "badge-ghost hover:badge-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error mb-6 max-w-2xl">
          <span>{error}</span>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-base-content/50">
            {activeQuery
              ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${activeQuery}"`
              : `${results.length} item${results.length !== 1 ? "s" : ""} in your library`}
          </p>
          {activeQuery && (
            <button onClick={handleClear} className="btn btn-ghost btn-xs gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-base-300">
              <div className="aspect-video skeleton" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3.5 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
          {activeQuery ? (
            <>
              <Search className="w-12 h-12 mb-3" />
              <p className="font-medium">No results for &quot;{activeQuery}&quot;</p>
              <p className="text-sm mt-1 text-center max-w-sm">
                Try a different keyword or upload images — Vision AI will auto-tag them
              </p>
              <button onClick={handleClear} className="btn btn-ghost btn-sm mt-4">
                Show all media
              </button>
            </>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 mb-3" />
              <p className="font-medium">No media yet</p>
              <p className="text-sm mt-1">Upload images or videos to get started</p>
            </>
          )}
        </div>
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map(result => (
            <div
              key={result.publicId}
              className="group relative rounded-xl overflow-hidden border border-base-300 bg-base-100 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200"
              onClick={() => setSelected(result)}
            >
              <div className="aspect-video bg-base-200 relative overflow-hidden">
                {result.resourceType === "video" ? (
                  <>
                    <img
                      src={result.url.replace("/video/upload/", "/video/upload/so_2,w_400,h_225,c_fill,f_jpg/")}
                      alt={result.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="badge badge-sm bg-black/60 text-white border-0 gap-1">
                        <Video className="w-2.5 h-2.5" /> Video
                      </span>
                    </div>
                  </>
                ) : (
                  <img
                    src={result.url}
                    alt={result.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {result.tags.length > 0 && (
                  <div className="absolute bottom-2 right-2">
                    <span className="badge badge-sm bg-purple-600/80 text-white border-0 gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {result.tags.length} AI tags
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </div>

              <div className="p-3">
                <p className="text-xs font-medium truncate text-base-content">{result.title}</p>
                {result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {result.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-100 capitalize"
                      >
                        {tag.replace(/_/g, " ")}
                      </span>
                    ))}
                    {result.tags.length > 3 && (
                      <span className="text-xs text-base-content/40">+{result.tags.length - 3}</span>
                    )}
                  </div>
                )}
                <p className="text-xs text-base-content/40 mt-1.5">
                  {formatBytes(result.bytes)}
                  {result.bytes && result.format ? " · " : ""}
                  {result.format?.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <div className="flex items-center gap-2">
                {selected.resourceType === "video"
                  ? <Video className="w-4 h-4 text-primary" />
                  : <ImageIcon className="w-4 h-4 text-primary" />}
                <span className="font-semibold text-base-content truncate max-w-xs">{selected.title}</span>
              </div>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSelected(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black">
              {selected.resourceType === "video" ? (
                <video src={selected.url} controls autoPlay className="w-full max-h-[60vh]" />
              ) : (
                <img src={selected.url} alt={selected.title} className="w-full max-h-[60vh] object-contain" />
              )}
            </div>

            {selected.tags.length > 0 && (
              <div className="p-4 border-t border-base-300">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-semibold text-base-content/70 uppercase tracking-wide">
                    AI Detected Labels
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelected(null)
                        const t = tag.replace(/_/g, " ")
                        setQuery(t)
                        handleSearch(t)
                      }}
                      className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs border border-purple-200 transition-colors capitalize cursor-pointer"
                    >
                      {tag.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-base-content/40 mt-2">Click any label to search for similar media</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}