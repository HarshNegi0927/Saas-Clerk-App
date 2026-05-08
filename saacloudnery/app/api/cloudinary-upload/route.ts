import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("file") as File
    // "social" = public + AI tagged, "effects" = private, no tagging
    const uploadType = formData.get("uploadType") as string || "effects"

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const isVideo = file.type.startsWith("video/")
    const resourceType = isVideo ? "video" : "image"

    const isSocial = uploadType === "social"

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          // Social uploads go to public folder with AI tagging
          // Effects uploads go to private folder, no tagging
          folder: isSocial ? `social_share` : `private_effects/user_${userId}`,
          public_id: `${Date.now()}_${file.name.split(".")[0]}`,
          overwrite: true,
          context: {
            alt: file.name,
            upload_type: uploadType,
          },
          // Only apply AI tagging for social share uploads
          ...(isSocial && !isVideo ? {
            categorization: "google_tagging",
            auto_tagging: 0.6,
          } : {}),
          // Tag private uploads so we can exclude from search
          tags: isSocial ? ["social_share"] : ["private", "effects_only"],
          transformation:
            resourceType === "image"
              ? [{ quality: "auto", fetch_format: "auto" }]
              : [{ quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const aiTags = isSocial ? (result?.tags?.filter((t: string) => t !== "social_share") || []) : []
    console.log(`✅ Upload [${uploadType}]:`, result?.public_id, isSocial ? `tags: ${aiTags}` : "(private)")

    return NextResponse.json({
      success: true,
      result,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      resourceType,
      aiTags,
      isPrivate: !isSocial,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}