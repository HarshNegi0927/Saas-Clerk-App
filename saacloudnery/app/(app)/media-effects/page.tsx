"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Wand2, Download, Share2, ImageIcon, Video, Zap, Palette, Scissors, Sparkles, AlertCircle } from "lucide-react"

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
  const [transformError, setTransformError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableEffects()
  }, [])

  const fetchAvailableEffects = async () => {
    try {
      const response = await fetch("/api/media-effects")
      if (response.ok) {
        const data = await response.json()
        setAvailableEffects(data.effects)
      } else {
        console.error("Failed to fetch effects")
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
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/cloudinary-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUploadedMedia({
          publicId: data.publicId,
          originalUrl: data.secureUrl,
          fileName: file.name,
          size: file.size,
          mediaType: data.resourceType,
        })
        console.log("Upload successful:", data)
      } else {
        setUploadError(data.error || "Upload failed")
        console.error("Upload error:", data)
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
    setTransformError(null)

    try {
      console.log("Applying effects:", {
        publicId: uploadedMedia.publicId,
        effects: selectedEffects,
        mediaType: uploadedMedia.mediaType,
      })

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

      const data = await response.json()
      console.log("Transform response:", data)

      if (response.ok && data.success) {
        setUploadedMedia((prev) =>
          prev
            ? {
                ...prev,
                transformedUrl: data.transformedUrl,
              }
            : null,
        )
      } else {
        setTransformError(data.error || "Transformation failed")
        console.error("Transform error:", data)
      }
    } catch (error) {
      console.error("Transformation failed:", error)
      setTransformError("Transformation failed. Please try again.")
    } finally {
      setTransforming(false)
    }
  }

  const downloadMedia = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try again.")
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Media Effects & Compression</h1>
          <p className="text-lg text-gray-600">
            Upload images or videos and apply professional effects, compression, and transformations
          </p>
        </div>

        {!uploadedMedia ? (
          <div className="max-w-2xl mx-auto">
            {uploadError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-8">
              {uploading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading media...</h3>
                  <p className="text-gray-600">This may take a moment for large files</p>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-12 h-12 text-gray-400 mx-auto mb-4">📁</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragActive ? "Drop your media here" : "Drag & drop your media here"}
                  </h3>
                  <p className="text-gray-600 mb-4">or browse files</p>
                  <div className="text-sm text-gray-500">
                    <p>Supports: Images (JPG, PNG, GIF, WebP) & Videos (MP4, AVI, MOV, WebM)</p>
                    <p>Max file size: 100MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Media Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Media Preview</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Original</h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    {uploadedMedia.mediaType === "video" ? (
                      <video src={uploadedMedia.originalUrl} controls className="w-full max-h-64 rounded-lg" />
                    ) : (
                      <img
                        src={uploadedMedia.originalUrl || "/placeholder.svg"}
                        alt="Original media"
                        className="w-full max-h-64 object-contain rounded-lg"
                      />
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      Size: {(uploadedMedia.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {uploadedMedia.transformedUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Processed</h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                      {uploadedMedia.mediaType === "video" ? (
                        <video src={uploadedMedia.transformedUrl} controls className="w-full max-h-64 rounded-lg" />
                      ) : (
                        <img
                          src={uploadedMedia.transformedUrl || "/placeholder.svg"}
                          alt="Processed media"
                          className="w-full max-h-64 object-contain rounded-lg"
                        />
                      )}
                      <p className="text-sm text-green-600 mt-2 font-medium">Optimized</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Effects Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply Effects & Transformations</h2>

              {transformError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{transformError}</span>
                </div>
              )}

              {/* Category Tabs */}
              <div className="mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableEffects &&
                    Object.keys(availableEffects).map((category) => {
                      const IconComponent = categoryIcons[category as keyof typeof categoryIcons]
                      return (
                        <button
                          key={category}
                          onClick={() => setActiveCategory(category)}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all border-2 ${
                            activeCategory === category
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {categoryNames[category as keyof typeof categoryNames]}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Effects Grid */}
              {availableEffects && availableEffects[activeCategory as keyof AvailableEffects] && (
                <div className="mb-6 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {Object.entries(availableEffects[activeCategory as keyof AvailableEffects]).map(
                      ([effectId, description]) => (
                        <label
                          key={effectId}
                          className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEffects.includes(effectId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEffects([...selectedEffects, effectId])
                              } else {
                                setSelectedEffects(selectedEffects.filter((id) => id !== effectId))
                              }
                            }}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {effectId.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="text-sm text-gray-600">{description}</div>
                          </div>
                        </label>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={applyEffects}
                  disabled={selectedEffects.length === 0 || transforming}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {transforming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        downloadMedia(uploadedMedia.transformedUrl!, `processed_${uploadedMedia.fileName}`)
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = `/social-share?url=${encodeURIComponent(uploadedMedia.transformedUrl!)}`
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
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
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Upload New Media
                </button>
              </div>

              {/* Selected Effects Summary */}
              {selectedEffects.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Effects:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEffects.map((effect) => (
                      <span
                        key={effect}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {effect.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
