import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const q = request.nextUrl.searchParams.get("q") || ""
    if (!q.trim()) return NextResponse.json({ results: [] })

    const keyword = q.toLowerCase().trim()
    const tagVariant = keyword.replace(/\s+/g, "_")

    // IMPORTANT: Only search social_share folder — exclude private effects uploads
    // We filter by folder:social_share to ensure privacy
    const baseExpression = `folder:social_share`

    let resources: any[] = []

    // Strategy 1: Tag search within social_share folder only
    try {
      const tagResult = await cloudinary.search
        .expression(`${baseExpression} AND tags:${tagVariant}`)
        .sort_by("created_at", "desc")
        .with_field("tags")
        .with_field("context")
        .max_results(30)
        .execute()
      resources = tagResult.resources || []
    } catch (e) {
      console.log("Tag search failed:", e)
    }

    // Strategy 2: Partial tag match within social folder
    if (resources.length === 0) {
      try {
        const partialResult = await cloudinary.search
          .expression(`${baseExpression} AND tags:*${keyword}*`)
          .sort_by("created_at", "desc")
          .with_field("tags")
          .with_field("context")
          .max_results(30)
          .execute()
        resources = partialResult.resources || []
      } catch (e) {
        console.log("Partial tag search failed:", e)
      }
    }

    // Strategy 3: Filename search within social folder
    if (resources.length === 0) {
      try {
        const pidResult = await cloudinary.search
          .expression(`${baseExpression} AND public_id:*${keyword}*`)
          .sort_by("created_at", "desc")
          .with_field("tags")
          .with_field("context")
          .max_results(30)
          .execute()
        resources = pidResult.resources || []
      } catch (e) {
        console.log("Filename search failed:", e)
      }
    }

    // Strategy 4: Show all social_share uploads as fallback
    if (resources.length === 0) {
      try {
        const allSocial = await cloudinary.search
          .expression(baseExpression)
          .sort_by("created_at", "desc")
          .with_field("tags")
          .max_results(24)
          .execute()
        resources = allSocial.resources || []
      } catch (e) {
        console.log("Fallback search failed:", e)
      }
    }

    const results = resources.map((r: any) => {
      const filename = r.public_id.split("/").pop() || r.public_id
      const readableName = filename.replace(/[-_]/g, " ").replace(/^\d{13}\s/, "").trim()
      return {
        publicId: r.public_id,
        url: r.secure_url,
        resourceType: r.resource_type,
        title: r.context?.caption || readableName,
        createdAt: r.created_at,
        tags: (r.tags || []).filter((t: string) => t !== "social_share"),
        bytes: r.bytes,
        format: r.format,
      }
    })

    return NextResponse.json({ results, query: q, total: results.length })
  } catch (error: any) {
    console.error("Smart search error:", error)
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 })
  }
}