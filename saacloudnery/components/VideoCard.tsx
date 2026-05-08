"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary"
import { Download, Clock, FileDown, FileUp, Play, X } from "lucide-react"
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { filesize } from "filesize"
import { Video } from '@/types'

dayjs.extend(relativeTime)

interface VideoCardProps {
  video: Video
  onDownload: (url: string, title: string) => void
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video"
    })
  }, [])

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    })
  }, [])

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"]
    })
  }, [])

  // ✅ FIX: Download using fl_attachment Cloudinary flag (bypasses CORS)
  const handleDownload = useCallback((publicId: string, title: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const downloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload/fl_attachment/${publicId}`
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `${title}.mp4`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const formatSize = useCallback((size: number) => filesize(size), [])

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }, [])

  const compressionPercentage = Math.round(
    (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
  )

  useEffect(() => {
    setPreviewError(false)
  }, [isHovered])

  // ✅ Close modal on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false)
    }
    if (showModal) window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [showModal])

  return (
    <>
      <div
        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ✅ Thumbnail / Preview with Play button overlay */}
        <figure className="aspect-video relative cursor-pointer" onClick={() => setShowModal(true)}>
          {isHovered ? (
            previewError ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <p className="text-red-500">Preview not available</p>
              </div>
            ) : (
              <video
                src={getPreviewVideoUrl(video.publicId)}
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
              />
            )
          ) : (
            <img
              src={getThumbnailUrl(video.publicId)}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <Play className="w-8 h-8 text-gray-800 fill-gray-800" />
            </div>
          </div>

          <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
            <Clock size={16} className="mr-1" />
            {formatDuration(video.duration)}
          </div>
        </figure>

        <div className="card-body p-4">
          <h2 className="card-title text-lg font-bold">{video.title}</h2>
          <p className="text-sm text-base-content opacity-70 mb-2">{video.description}</p>
          <p className="text-sm text-base-content opacity-70 mb-4">
            Uploaded {dayjs(video.createdAt).fromNow()}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <FileUp size={18} className="mr-2 text-primary" />
              <div>
                <div className="font-semibold">Original</div>
                <div>{formatSize(Number(video.originalSize))}</div>
              </div>
            </div>
            <div className="flex items-center">
              <FileDown size={18} className="mr-2 text-secondary" />
              <div>
                <div className="font-semibold">Compressed</div>
                <div>{formatSize(Number(video.compressedSize))}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm font-semibold">
              Compression: <span className="text-accent">{compressionPercentage}%</span>
            </div>
            <div className="flex gap-2">
              {/* Play button */}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowModal(true)}
              >
                <Play size={16} />
              </button>
              {/* Download button */}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleDownload(video.publicId, video.title)}
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FIX: Full video playback modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-base-100 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold truncate">{video.title}</h3>
              <button
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-black">
              <video
                src={getFullVideoUrl(video.publicId)}
                controls
                autoPlay
                className="w-full max-h-[70vh]"
              />
            </div>
            <div className="p-4 flex justify-end gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleDownload(video.publicId, video.title)}
              >
                <Download size={16} className="mr-1" />
                Download
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VideoCard