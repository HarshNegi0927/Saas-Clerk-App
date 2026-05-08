"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  Upload, Share2, Download, Link, Check, Loader2,
  Twitter, Instagram, Facebook, AlertCircle
} from "lucide-react"

// Platform definitions with their ideal ratios
const PLATFORMS = [
  {
    id: "instagram_post",
    name: "Instagram Post",
    icon: "📷",
    color: "#E1306C",
    bg: "bg-pink-50",
    border: "border-pink-200",
    ratio: "1:1",
    width: 1080,
    height: 1080,
    description: "Square post",
    shareUrl: (url: string, text: string) =>
      `https://www.instagram.com/`,  // Instagram doesn't support direct share URL, opens app
  },
  {
    id: "instagram_story",
    name: "Instagram Story",
    icon: "📱",
    color: "#833AB4",
    bg: "bg-purple-50",
    border: "border-purple-200",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    description: "Full screen vertical",
    shareUrl: (url: string, text: string) => `https://www.instagram.com/`,
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "🐦",
    color: "#1DA1F2",
    bg: "bg-blue-50",
    border: "border-blue-200",
    ratio: "16:9",
    width: 1200,
    height: 675,
    description: "Landscape tweet",
    shareUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "👥",
    color: "#1877F2",
    bg: "bg-blue-50",
    border: "border-blue-200",
    ratio: "1.91:1",
    width: 1200,
    height: 630,
    description: "Link preview",
    shareUrl: (url: string, text: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    color: "#E60023",
    bg: "bg-red-50",
    border: "border-red-200",
    ratio: "2:3",
    width: 1000,
    height: 1500,
    description: "Tall pin",
    shareUrl: (url: string, text: string) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}&media=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
    color: "#25D366",
    bg: "bg-green-50",
    border: "border-green-200",
    ratio: "1:1",
    width: 800,
    height: 800,
    description: "Status / message",
    shareUrl: (url: string, text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "#0A66C2",
    bg: "bg-sky-50",
    border: "border-sky-200",
    ratio: "1.91:1",
    width: 1200,
    height: 627,
    description: "Post / article",
    shareUrl: (url: string, text: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "youtube",
    name: "YouTube Thumbnail",
    icon: "▶️",
    color: "#FF0000",
    bg: "bg-red-50",
    border: "border-red-200",
    ratio: "16:9",
    width: 1280,
    height: 720,
    description: "Video thumbnail",
    shareUrl: (url: string, text: string) => `https://youtube.com`,
  },
]

interface UploadedImage {
  publicId: string
  originalUrl: string
  fileName: string
}

export default function SocialSharePage() {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0])
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null)
  const [transforming, setTransforming] = useState(false)
  const [caption, setCaption] = useState("")
  const [copied, setCopied] = useState(false)
  const [shareText, setShareText] = useState("Check out this image!")

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    setTransformedUrl(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      // Social share uploads are PUBLIC and AI-tagged
      formData.append("uploadType", "social")

      const res = await fetch("/api/cloudinary-upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setUploadedImage({
          publicId: data.publicId,
          originalUrl: data.secureUrl,
          fileName: file.name,
        })
        // Auto-generate for first platform
        generateForPlatform(data.publicId, PLATFORMS[0])
      } else {
        setUploadError(data.error || "Upload failed")
      }
    } catch (e) {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  })

  const generateForPlatform = async (publicId: string, platform: typeof PLATFORMS[0]) => {
    setTransforming(true)
    setTransformedUrl(null)

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      // Use Cloudinary URL transformation to resize/crop for platform
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/w_${platform.width},h_${platform.height},c_fill,g_auto,f_auto,q_auto/${publicId}`
      // Small delay to show loading state
      await new Promise(r => setTimeout(r, 500))
      setTransformedUrl(url)
    } finally {
      setTransforming(false)
    }
  }

  const handlePlatformSelect = (platform: typeof PLATFORMS[0]) => {
    setSelectedPlatform(platform)
    if (uploadedImage) {
      generateForPlatform(uploadedImage.publicId, platform)
    }
  }

  const handleShare = () => {
    if (!transformedUrl) return
    const url = selectedPlatform.shareUrl(transformedUrl, shareText)
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600")
  }

  const handleDownload = async () => {
    if (!transformedUrl) return
    const link = document.createElement("a")
    link.href = transformedUrl
    link.download = `${selectedPlatform.id}_${uploadedImage?.fileName || "image"}`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyLink = async () => {
    if (!transformedUrl) return
    await navigator.clipboard.writeText(transformedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate preview box aspect ratio style
  const getPreviewStyle = () => {
    const [w, h] = selectedPlatform.ratio.split(":").map(Number)
    const ratio = (h / w) * 100
    return { paddingBottom: `${Math.min(ratio, 120)}%` }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Share2 className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-base-content">Social Share</h1>
        </div>
        <p className="text-base-content/60 text-sm ml-12">
          Resize your image for any platform and share directly — Instagram, Twitter, Pinterest & more
        </p>
      </div>

      {!uploadedImage ? (
        // Upload zone
        <div className="max-w-2xl mx-auto">
          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}
          <div className="bg-base-100 rounded-2xl border border-base-300 p-8">
            {uploading ? (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="font-medium text-base-content">Uploading & analyzing image...</p>
                <p className="text-sm text-base-content/50 mt-1">AI is detecting what's in your image</p>
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
                  {isDragActive ? "Drop your image here" : "Upload an image to share"}
                </h3>
                <p className="text-base-content/50 text-sm mb-1">Drag & drop or click to browse</p>
                <p className="text-base-content/40 text-xs">JPG, PNG, GIF, WebP up to 50MB</p>

                {/* Platform icons preview */}
                <div className="flex justify-center gap-3 mt-6 flex-wrap">
                  {PLATFORMS.slice(0, 6).map(p => (
                    <span key={p.id} className="text-2xl" title={p.name}>{p.icon}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left — Platform selector */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-base-content mb-3">Choose platform</h2>
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => handlePlatformSelect(platform)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selectedPlatform.id === platform.id
                    ? `${platform.border} ${platform.bg}`
                    : "border-base-300 hover:border-base-400 bg-base-100"
                }`}
              >
                <span className="text-2xl">{platform.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-base-content">{platform.name}</span>
                    <span className="badge badge-ghost badge-xs font-mono">{platform.ratio}</span>
                  </div>
                  <span className="text-xs text-base-content/50">
                    {platform.width}×{platform.height}px · {platform.description}
                  </span>
                </div>
                {selectedPlatform.id === platform.id && (
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: platform.color }} />
                )}
              </button>
            ))}
          </div>

          {/* Right — Preview + Share */}
          <div className="lg:col-span-3 space-y-4">
            {/* Image preview */}
            <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base-content flex items-center gap-2">
                  <span>{selectedPlatform.icon}</span>
                  {selectedPlatform.name} Preview
                  <span className="badge badge-ghost badge-sm font-mono">{selectedPlatform.ratio}</span>
                </h2>
              </div>

              {/* Aspect ratio preview box */}
              <div className="relative w-full bg-base-200 rounded-xl overflow-hidden" style={getPreviewStyle()}>
                <div className="absolute inset-0">
                  {transforming ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : transformedUrl ? (
                    <img
                      src={transformedUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base-content/30">
                      <p className="text-sm">Generating preview...</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-base-content/40 mt-2 text-center">
                Auto-cropped to {selectedPlatform.width}×{selectedPlatform.height}px using AI face/subject detection
              </p>
            </div>

            {/* Share caption */}
            <div className="bg-base-100 rounded-2xl border border-base-300 p-5">
              <label className="text-sm font-medium text-base-content/70 mb-2 block">
                Caption / message
              </label>
              <textarea
                value={shareText}
                onChange={e => setShareText(e.target.value)}
                className="textarea textarea-bordered w-full text-sm resize-none"
                rows={2}
                placeholder="Add a caption for your post..."
              />
            </div>

            {/* Action buttons */}
            <div className="bg-base-100 rounded-2xl border border-base-300 p-5 space-y-3">
              <h3 className="font-medium text-base-content text-sm">Share or download</h3>

              {/* Primary share button */}
              <button
                onClick={handleShare}
                disabled={!transformedUrl || transforming}
                className="w-full btn text-white border-0 gap-2"
                style={{
                  background: selectedPlatform.color,
                  opacity: !transformedUrl || transforming ? 0.5 : 1
                }}
              >
                <span>{selectedPlatform.icon}</span>
                Share to {selectedPlatform.name}
              </button>

              {/* Secondary actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!transformedUrl}
                  className="btn btn-outline btn-sm gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={handleCopyLink}
                  disabled={!transformedUrl}
                  className={`btn btn-sm gap-1 ${copied ? "btn-success" : "btn-outline"}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>

              {/* All platforms quick share */}
              <div className="pt-2 border-t border-base-300">
                <p className="text-xs text-base-content/50 mb-2">Share to other platforms</p>
                <div className="flex gap-2 flex-wrap">
                  {PLATFORMS.filter(p => p.id !== selectedPlatform.id).map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (transformedUrl) {
                          const url = p.shareUrl(transformedUrl, shareText)
                          window.open(url, "_blank", "noopener,noreferrer,width=600,height=600")
                        }
                      }}
                      disabled={!transformedUrl}
                      className="btn btn-ghost btn-xs gap-1 border border-base-300"
                      title={`Share to ${p.name}`}
                    >
                      <span>{p.icon}</span>
                      <span className="hidden sm:inline">{p.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Upload new */}
            <button
              onClick={() => {
                setUploadedImage(null)
                setTransformedUrl(null)
                setUploadError(null)
              }}
              className="btn btn-ghost w-full"
            >
              Upload different image
            </button>
          </div>
        </div>
      )}
    </div>
  )
}