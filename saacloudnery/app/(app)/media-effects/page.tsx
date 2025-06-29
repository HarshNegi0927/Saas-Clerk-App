"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Wand2, Download, Share2, ImageIcon, Video, Zap, Palette, Scissors, Sparkles } from "lucide-react"

interface UploadedMedia {
  publicId: string
  originalUrl: string
  transformedUrl?: string
  fileName: string
  size: number
  mediaType: "image" | "video"
}

interface EffectCategory {
  [key: string]: string
}

interface AvailableEffects {
  compression: EffectCategory
  enhancement: EffectCategory
  colorAdjustments: EffectCategory
  artisticEffects: EffectCategory
  backgroundEffects: EffectCategory
  resizing: EffectCategory
  videoEffects: EffectCategory
}

export default function MediaEffectsPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null)
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [transforming, setTransforming] = useState(false)
  const [availableEffects, setAvailableEffects] = useState<AvailableEffects | null>(null)
  const [activeCategory, setActiveCategory] = useState("compression")
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableEffects()
  }, [])

  const fetchAvailableEffects = async () => {
    try {
      const response = await fetch("/api/media-effects")
      if (response.ok) {
        const data = await response.json()
        setAvailableEffects(data.effects)
      }
    } catch (error) {
      console.error("Failed to fetch effects:", error)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      // Use our signed upload API instead of direct Cloudinary upload
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/cloudinary-upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedMedia({
          publicId: data.publicId,
          originalUrl: data.secureUrl,
          fileName: file.name,
          size: file.size,
          mediaType: data.resourceType,
        })
      } else {
        const errorData = await response.json()
        setUploadError(errorData.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload failed:", error)
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
    maxSize: 100 * 1024 * 1024, // 100MB limit
  })

  const applyEffects = async () => {
    if (!uploadedMedia || selectedEffects.length === 0) return

    setTransforming(true)

    try {
      const response = await fetch("/api/media-effects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId: uploadedMedia.publicId,
          effects: selectedEffects,
          mediaType: uploadedMedia.mediaType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedMedia((prev) =>
          prev
            ? {
                ...prev,
                transformedUrl: data.transformedUrl,
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Transformation failed:", error)
    } finally {
      setTransforming(false)
    }
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
    colorAdjustments: "Color Adjustments",
    artisticEffects: "Artistic Effects",
    backgroundEffects: "Background Effects",
    resizing: "Resizing",
    videoEffects: "Video Effects",
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Media Effects & Compression</h1>
          <p className="text-base-content/70">
            Upload images or videos and apply professional effects, compression, and transformations
          </p>
        </div>

        {!uploadedMedia ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              {uploadError && (
                <div className="alert alert-error mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{uploadError}</span>
                </div>
              )}

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary"
                }`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="space-y-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-lg font-semibold">Uploading media...</p>
                    <p className="text-sm text-base-content/70">This may take a moment for large files</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-4">
                      <ImageIcon className="w-16 h-16 text-primary" />
                      <Video className="w-16 h-16 text-secondary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        {isDragActive ? "Drop your media here" : "Drag & drop your media here"}
                      </p>
                      <p className="text-base-content/70">
                        or <span className="text-primary font-semibold">browse files</span>
                      </p>
                    </div>
                    <div className="text-sm text-base-content/50">
                      Supports: Images (JPG, PNG, GIF, WebP) & Videos (MP4, AVI, MOV, WebM)
                      <br />
                      Max file size: 100MB
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Media Preview */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Media Preview</h2>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Original</h3>
                    {uploadedMedia.mediaType === "video" ? (
                      <video
                        src={uploadedMedia.originalUrl}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: "300px" }}
                      />
                    ) : (
                      <img
                        src={uploadedMedia.originalUrl || "/placeholder.svg"}
                        alt="Original"
                        className="w-full rounded-lg object-contain"
                        style={{ maxHeight: "300px" }}
                      />
                    )}
                    <p className="text-sm text-base-content/70 mt-2">
                      Size: {(uploadedMedia.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {uploadedMedia.transformedUrl && (
                    <div>
                      <h3 className="font-semibold mb-2">Processed</h3>
                      {uploadedMedia.mediaType === "video" ? (
                        <video
                          src={uploadedMedia.transformedUrl}
                          controls
                          className="w-full rounded-lg"
                          style={{ maxHeight: "300px" }}
                        />
                      ) : (
                        <img
                          src={uploadedMedia.transformedUrl || "/placeholder.svg"}
                          alt="Processed"
                          className="w-full rounded-lg object-contain"
                          style={{ maxHeight: "300px" }}
                        />
                      )}
                      <div className="badge badge-success mt-2">Optimized</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Effects Panel */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  <Wand2 className="w-6 h-6" />
                  Apply Effects & Transformations
                </h2>

                {/* Category Tabs */}
                <div className="tabs tabs-boxed mb-6 overflow-x-auto">
                  {availableEffects &&
                    Object.keys(availableEffects).map((category) => {
                      const IconComponent = categoryIcons[category as keyof typeof categoryIcons]
                      return (
                        <button
                          key={category}
                          className={`tab gap-2 whitespace-nowrap ${activeCategory === category ? "tab-active" : ""}`}
                          onClick={() => setActiveCategory(category)}
                        >
                          <IconComponent className="w-4 h-4" />
                          {categoryNames[category as keyof typeof categoryNames]}
                        </button>
                      )
                    })}
                </div>

                {/* Effects Grid */}
                {availableEffects && availableEffects[activeCategory as keyof AvailableEffects] && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {Object.entries(availableEffects[activeCategory as keyof AvailableEffects]).map(
                      ([effectId, description]) => (
                        <label key={effectId} className="cursor-pointer">
                          <div
                            className={`card card-compact border-2 transition-colors ${
                              selectedEffects.includes(effectId)
                                ? "border-primary bg-primary/10"
                                : "border-base-300 hover:border-primary/50"
                            }`}
                          >
                            <div className="card-body">
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-primary mt-1"
                                  checked={selectedEffects.includes(effectId)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedEffects([...selectedEffects, effectId])
                                    } else {
                                      setSelectedEffects(selectedEffects.filter((id) => id !== effectId))
                                    }
                                  }}
                                />
                                <div>
                                  <div className="font-semibold text-sm capitalize">
                                    {effectId.replace(/([A-Z])/g, " $1").trim()}
                                  </div>
                                  <div className="text-xs text-base-content/70">{description}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ),
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button
                    className="btn btn-primary"
                    onClick={applyEffects}
                    disabled={selectedEffects.length === 0 || transforming}
                  >
                    {transforming ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Apply Effects ({selectedEffects.length})
                      </>
                    )}
                  </button>

                  {uploadedMedia.transformedUrl && (
                    <>
                      <a href={uploadedMedia.transformedUrl} download className="btn btn-outline">
                        <Download className="w-4 h-4" />
                        Download
                      </a>

                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          window.location.href = `/social-share?url=${encodeURIComponent(uploadedMedia.transformedUrl)}`
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </>
                  )}

                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setUploadedMedia(null)
                      setSelectedEffects([])
                      setUploadError(null)
                    }}
                  >
                    Upload New Media
                  </button>
                </div>

                {/* Selected Effects Summary */}
                {selectedEffects.length > 0 && (
                  <div className="mt-6 p-4 bg-base-200 rounded-lg">
                    <h3 className="font-semibold mb-2">Selected Effects:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEffects.map((effect) => (
                        <div key={effect} className="badge badge-primary">
                          {effect.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
