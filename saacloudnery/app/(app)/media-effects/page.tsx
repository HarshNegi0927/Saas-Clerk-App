"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import {
  Wand2, Download, Share2, ImageIcon, Video,
  Zap, Palette, Scissors, Sparkles, AlertCircle, Loader2, Upload
} from "lucide-react"

interface UploadedMedia {
  publicId: string
  originalUrl: string
  transformedUrl?: string
  fileName: string
  size: number
  mediaType: "image" | "video"
}

interface EffectCategory { [key: string]: string }
interface AvailableEffects {
  compression: EffectCategory
  enhancement: EffectCategory
  colorAdjustments: EffectCategory
  artisticEffects: EffectCategory
  backgroundEffects: EffectCategory
  resizing: EffectCategory
  videoEffects: EffectCategory
}

const categoryIcons = {
  compression: Zap,
  enhancement: Sparkles,
  colorAdjustments: Palette,
  artisticEffects: Wand2,
  backgroundEffects: Scissors,
  resizing: ImageIcon,
  videoEffects: Video,
}

const categoryNames = {
  compression: "Compression",
  enhancement: "Enhancement",
  colorAdjustments: "Color",
  artisticEffects: "Artistic",
  backgroundEffects: "Background",
  resizing: "Resizing",
  videoEffects: "Video",
}

export default function MediaEffectsPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null)
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [transforming, setTransforming] = useState(false)
  const [availableEffects, setAvailableEffects] = useState<AvailableEffects | null>(null)
  const [activeCategory, setActiveCategory] = useState("compression")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [transformError, setTransformError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/media-effects")
      .then(r => r.json())
      .then(data => setAvailableEffects(data.effects))
      .catch(console.error)
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/cloudinary-upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok && data.success) {
        setUploadedMedia({
          publicId: data.publicId,
          originalUrl: data.secureUrl,
          fileName: file.name,
          size: file.size,
          mediaType: data.resourceType,
        })
      } else {
        setUploadError(data.error || "Upload failed")
      }
    } catch {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  })

  const applyEffects = async () => {
    if (!uploadedMedia || selectedEffects.length === 0) return
    setTransforming(true)
    setTransformError(null)
    try {
      const res = await fetch("/api/media-effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: uploadedMedia.publicId,
          effects: selectedEffects,
          mediaType: uploadedMedia.mediaType,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUploadedMedia(prev => prev ? { ...prev, transformedUrl: data.transformedUrl } : null)
        // Save to history
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: uploadedMedia.publicId,
            originalUrl: uploadedMedia.originalUrl,
            transformedUrl: data.transformedUrl,
            effects: selectedEffects,
            mediaType: uploadedMedia.mediaType,
          }),
        })
      } else {
        setTransformError(data.error || "Transformation failed")
      }
    } catch {
      setTransformError("Transformation failed. Please try again.")
    } finally {
      setTransforming(false)
    }
  }

  const downloadMedia = async (url: string, filename: string) => {
    try {
      const blob = await fetch(url).then(r => r.blob())
      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      alert("Download failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Wand2 className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-base-content">Media Effects</h1>
        </div>
        <p className="text-base-content/60 text-sm ml-12">
          Apply professional effects, compression, and transformations to your images & videos
        </p>
      </div>

      {!uploadedMedia ? (
        <div className="max-w-2xl mx-auto">
          {uploadError && (
            <div className="alert alert-error mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
          <div className="bg-base-100 rounded-2xl border border-base-300 p-8">
            {uploading ? (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="font-medium text-base-content">Uploading media...</p>
                <p className="text-sm text-base-content/50 mt-1">This may take a moment for large files</p>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-base-300 hover:border-primary/50 hover:bg-base-200/30"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-base-content/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-base-content mb-2">
                  {isDragActive ? "Drop your media here" : "Upload image or video"}
                </h3>
                <p className="text-base-content/50 text-sm mb-1">Drag & drop or click to browse</p>
                <p className="text-base-content/40 text-xs">Images & Videos up to 100MB</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Media Preview */}
          <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
            <h2 className="font-semibold text-base-content mb-4">Preview</h2>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-2">Original</p>
                <div className="bg-base-200 rounded-xl p-3">
                  {uploadedMedia.mediaType === "video" ? (
                    <video src={uploadedMedia.originalUrl} controls className="w-full max-h-56 rounded-lg" />
                  ) : (
                    <img src={uploadedMedia.originalUrl} alt="Original" className="w-full max-h-56 object-contain rounded-lg" />
                  )}
                  <p className="text-xs text-base-content/40 mt-2">
                    {(uploadedMedia.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {uploadedMedia.transformedUrl && (
                <div>
                  <p className="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-2">Processed</p>
                  <div className="bg-base-200 rounded-xl p-3">
                    {uploadedMedia.mediaType === "video" ? (
                      <video src={uploadedMedia.transformedUrl} controls className="w-full max-h-56 rounded-lg" />
                    ) : (
                      <img src={uploadedMedia.transformedUrl} alt="Processed" className="w-full max-h-56 object-contain rounded-lg" />
                    )}
                    <p className="text-xs text-success mt-2 font-medium">✓ Optimized</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Effects Panel */}
          <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
            <h2 className="font-semibold text-base-content mb-4">Apply Effects</h2>

            {transformError && (
              <div className="alert alert-error mb-4 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{transformError}</span>
              </div>
            )}

            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-1.5 mb-5">
              {availableEffects && Object.keys(availableEffects).map(category => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons]
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all border ${
                      activeCategory === category
                        ? "bg-primary text-primary-content border-primary"
                        : "bg-base-200 text-base-content/70 border-base-300 hover:bg-base-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="leading-tight text-center">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Effects List */}
            {availableEffects && availableEffects[activeCategory as keyof AvailableEffects] && (
              <div className="space-y-2 max-h-56 overflow-y-auto mb-5 pr-1">
                {Object.entries(availableEffects[activeCategory as keyof AvailableEffects]).map(([effectId, description]) => (
                  <label
                    key={effectId}
                    className="flex items-start gap-3 p-3 border border-base-300 rounded-xl hover:bg-base-200 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEffects.includes(effectId)}
                      onChange={e => {
                        setSelectedEffects(prev =>
                          e.target.checked ? [...prev, effectId] : prev.filter(id => id !== effectId)
                        )
                      }}
                      className="checkbox checkbox-primary checkbox-sm mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-base-content">
                        {effectId.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-xs text-base-content/50">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Selected tags */}
            {selectedEffects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedEffects.map(effect => (
                  <span key={effect} className="badge badge-primary badge-sm">
                    {effect.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={applyEffects}
                disabled={selectedEffects.length === 0 || transforming}
                className="btn btn-primary w-full gap-2"
              >
                {transforming
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : <><Wand2 className="w-4 h-4" /> Apply Effects ({selectedEffects.length})</>
                }
              </button>

              {uploadedMedia.transformedUrl && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => downloadMedia(uploadedMedia.transformedUrl!, `processed_${uploadedMedia.fileName}`)}
                    className="btn btn-success btn-sm gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    onClick={() => window.location.href = `/social-share?url=${encodeURIComponent(uploadedMedia.transformedUrl!)}`}
                    className="btn btn-secondary btn-sm gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setUploadedMedia(null)
                  setSelectedEffects([])
                  setUploadError(null)
                  setTransformError(null)
                }}
                className="btn btn-ghost btn-sm w-full"
              >
                Upload New Media
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}