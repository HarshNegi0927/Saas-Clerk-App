"use client"

import { useState, useEffect, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  Upload, Download, Loader2, AlertCircle, ImageIcon, X
} from "lucide-react"

interface MediaItem {
  publicId: string
  url: string
  title: string
  createdAt: string
  bytes?: number
  format?: string
}

export default function SocialSharePage() {
  const [images, setImages] = useState<MediaItem[]>([])
  const [loadingImages, setLoadingImages] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<MediaItem | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    setLoadingImages(true)
    try {
      const res = await fetch("/api/smart-search?q=all")
      const data = await res.json()
      setImages((data.results || []).filter((r: any) => r.resourceType === "image"))
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingImages(false)
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
      formData.append("uploadType", "social")
      const res = await fetch("/api/cloudinary-upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok && data.success) {
        await fetchImages()
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
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  })

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = title
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <div className="p-2 bg-blue-100 rounded-xl">
            <ImageIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-base-content">My Images</h1>
        </div>
        <p className="text-base-content/60 text-sm ml-12">
          Upload images to Cloudinary and view your library
        </p>
      </div>

      {/* Upload zone */}
      <div className="mb-8 max-w-2xl">
        {uploadError && (
          <div className="alert alert-error mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadError}</span>
          </div>
        )}
        {uploading ? (
          <div className="bg-base-100 border border-base-300 rounded-2xl p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="font-medium text-base-content">Uploading image...</p>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-base-300 hover:border-primary/50 hover:bg-base-200/30"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-base-content/30 mx-auto mb-3" />
            <p className="font-medium text-base-content mb-1">
              {isDragActive ? "Drop image here" : "Upload a new image"}
            </p>
            <p className="text-xs text-base-content/40">JPG, PNG, GIF, WebP up to 50MB</p>
          </div>
        )}
      </div>

      {/* Image library */}
      <div>
        <p className="text-sm font-medium text-base-content/60 mb-4">
          Your images ({images.length})
        </p>

        {loadingImages ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-base-300">
                <div className="aspect-square skeleton" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
            <ImageIcon className="w-12 h-12 mb-3" />
            <p className="font-medium">No images yet</p>
            <p className="text-sm mt-1">Upload an image above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div
                key={img.publicId}
                className="group rounded-xl overflow-hidden border border-base-300 bg-base-100 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200"
                onClick={() => setSelected(img)}
              >
                <div className="aspect-square bg-base-200 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium truncate text-base-content">{img.title}</p>
                  <p className="text-xs text-base-content/40 mt-1">
                    {formatBytes(img.bytes)}
                    {img.bytes && img.format ? " · " : ""}
                    {img.format?.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <span className="font-semibold text-base-content truncate max-w-xs">{selected.title}</span>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSelected(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black">
              <img
                src={selected.url}
                alt={selected.title}
                className="w-full max-h-[60vh] object-contain"
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-base-content/50">
                {formatBytes(selected.bytes)}
                {selected.bytes && selected.format ? " · " : ""}
                {selected.format?.toUpperCase()}
                {" · "}{new Date(selected.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDownload(selected.url, selected.title)}
                className="btn btn-primary btn-sm gap-2"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}