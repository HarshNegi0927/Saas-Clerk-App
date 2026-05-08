import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const range = request.nextUrl.searchParams.get("range") || "30d"
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30

    const since = new Date()
    since.setDate(since.getDate() - days)

    const prevSince = new Date()
    prevSince.setDate(prevSince.getDate() - days * 2)

    // Fetch all videos — Video model has no userId so we get everything
    const [allVideos, recentVideos, previousVideos] = await Promise.all([
      prisma.video.findMany({
        select: {
          id: true,
          compressedSize: true,
          originalSize: true,
          duration: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.video.count({ where: { createdAt: { gte: since } } }),
      prisma.video.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
    ])

    const totalVideos = allVideos.length

    // Total storage from compressedSize
    const totalStorageBytes = allVideos.reduce(
      (sum, v) => sum + Number(v.compressedSize || 0), 0
    )

    // Videos uploaded within the selected range
    const videosInRange = allVideos.filter(
      v => new Date(v.createdAt) >= since
    )

    const recentStorageBytes = videosInRange.reduce(
      (sum, v) => sum + Number(v.compressedSize || 0), 0
    )

    // Change % vs previous period
    const uploadsChange = previousVideos === 0
      ? (recentVideos > 0 ? 100 : 0)
      : Math.round(((recentVideos - previousVideos) / previousVideos) * 100)

    // Build day-by-day buckets for the selected range
    const dayCounts: Record<string, number> = {}
    const dayStorage: Record<string, number> = {}

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      dayCounts[key] = 0
      dayStorage[key] = 0
    }

    videosInRange.forEach(v => {
      const key = new Date(v.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric",
      })
      if (dayCounts[key] !== undefined) {
        dayCounts[key]++
        dayStorage[key] += Number(v.compressedSize || 0)
      }
    })

    const uploadsByDay = Object.entries(dayCounts).map(([date, count]) => ({ date, count }))
    const storageByDay = Object.entries(dayStorage).map(([date, bytes]) => ({ date, bytes }))

    // Total duration of all videos
    const totalDuration = allVideos.reduce((sum, v) => sum + (v.duration || 0), 0)

    // Compression savings
    const totalOriginalBytes = allVideos.reduce(
      (sum, v) => sum + Number(v.originalSize || 0), 0
    )
    const savedBytes = totalOriginalBytes - totalStorageBytes
    const compressionRate = totalOriginalBytes > 0
      ? Math.round((savedBytes / totalOriginalBytes) * 100)
      : 0

    // Transformation history stats (safe — won't crash if table doesn't exist)
    let totalTransformations = 0
    let topEffects: { effect: string; count: number }[] = []

    try {
      const historyRecords = await (prisma as any).transformationHistory.findMany({
        select: { effects: true },
      })
      totalTransformations = historyRecords.length

      // Count each effect usage
      const effectCounts: Record<string, number> = {}
      historyRecords.forEach((r: any) => {
        (r.effects || []).forEach((e: string) => {
          effectCounts[e] = (effectCounts[e] || 0) + 1
        })
      })
      topEffects = Object.entries(effectCounts)
        .map(([effect, count]) => ({ effect, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    } catch {
      // Table doesn't exist yet — use empty defaults
      totalTransformations = 0
      topEffects = []
    }

    // Media type breakdown from actual video data
    const transformationsByType = [
      { type: "Videos", count: totalVideos },
      { type: "Compressed", count: allVideos.filter(v => Number(v.compressedSize) < Number(v.originalSize)).length },
      { type: "Transformations", count: totalTransformations },
    ].filter(t => t.count > 0)

    return NextResponse.json({
      summary: {
        totalUploads: totalVideos,
        totalStorageBytes,
        totalTransformations,
        totalDurationSeconds: Math.round(totalDuration),
        savedBytes,
        compressionRate,
        uploadsChange,
        storageChange: totalStorageBytes > 0
          ? Math.round((recentStorageBytes / totalStorageBytes) * 100)
          : 0,
      },
      uploadsByDay,
      transformationsByType,
      storageByDay,
      topEffects,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}