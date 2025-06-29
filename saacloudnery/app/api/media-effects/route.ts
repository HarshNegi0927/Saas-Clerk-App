import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { publicId, effects, mediaType = "image" } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 })
    }

    if (!effects || effects.length === 0) {
      return NextResponse.json({ error: "No effects specified" }, { status: 400 })
    }

    // Build Cloudinary transformation URL
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 })
    }

    const baseUrl = `https://res.cloudinary.com/${cloudName}`

    // Advanced transformation effects
    const effectsMap = {
      // Compression & Optimization
      autoCompress: "q_auto,f_auto",
      webpFormat: "f_webp",
      avifFormat: "f_avif",

      // Enhancement Effects
      autoEnhance: "e_auto_color,e_auto_contrast,e_auto_brightness",
      sharpen: "e_sharpen:100",
      unsharpMask: "e_unsharp_mask:200",

      // Color Effects
      vibrance: "e_vibrance:30",
      saturation: "e_saturation:20",
      brightness: "e_brightness:10",
      contrast: "e_contrast:15",

      // Artistic Effects
      blur: "e_blur:300",
      grayscale: "e_grayscale",
      sepia: "e_sepia:80",
      vintage: "e_sepia:50,e_brightness:-10,e_contrast:15",

      // Background Effects
      removeBackground: "e_background_removal",
      blurBackground: "e_blur_region:1000,g_face",

      // Size & Format
      resize800: "w_800,h_600,c_fit",
      resize1200: "w_1200,h_900,c_fit",
      thumbnail: "w_300,h_300,c_thumb,g_face",

      // Video Specific
      videoCompress: "q_auto,f_auto",
      generateThumbnail: "so_2.0,w_400,h_300,c_fill",
      videoPreview: "so_0,du_3,w_400,h_300,c_fill,f_gif",
    }

    // Build transformation string
    const transforms = effects
      .map((effect: string) => effectsMap[effect as keyof typeof effectsMap])
      .filter(Boolean)
      .join(",")

    if (!transforms) {
      return NextResponse.json({ error: "No valid effects found" }, { status: 400 })
    }

    const mediaPath = mediaType === "video" ? "video" : "image"
    const originalUrl = `${baseUrl}/${mediaPath}/upload/${publicId}`
    const transformedUrl = `${baseUrl}/${mediaPath}/upload/${transforms}/${publicId}`

    // Calculate estimated compression (mock calculation)
    const estimatedCompression = effects.includes("autoCompress") ? "60-80%" : "0%"

    console.log("Transformation applied:", {
      publicId,
      effects,
      transforms,
      transformedUrl,
    })

    return NextResponse.json({
      success: true,
      originalUrl,
      transformedUrl,
      effects: effects || [],
      publicId,
      mediaType,
      estimatedCompression,
      transformationString: transforms,
    })
  } catch (error) {
    console.error("Media effects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return available effects and their descriptions
    const availableEffects = {
      compression: {
        autoCompress: "Smart compression with quality preservation",
        webpFormat: "Convert to WebP format (smaller size)",
        avifFormat: "Convert to AVIF format (best compression)",
      },
      enhancement: {
        autoEnhance: "AI-powered auto enhancement",
        sharpen: "Sharpen image details",
        unsharpMask: "Advanced sharpening technique",
      },
      colorAdjustments: {
        vibrance: "Boost color vibrance",
        saturation: "Increase color saturation",
        brightness: "Adjust brightness levels",
        contrast: "Enhance contrast",
      },
      artisticEffects: {
        blur: "Apply blur effect",
        grayscale: "Convert to grayscale",
        sepia: "Apply sepia tone",
        vintage: "Vintage photo effect",
      },
      backgroundEffects: {
        removeBackground: "AI background removal",
        blurBackground: "Blur background, keep subject sharp",
      },
      resizing: {
        resize800: "Resize to 800x600 (web optimized)",
        resize1200: "Resize to 1200x900 (high quality)",
        thumbnail: "Create thumbnail (300x300)",
      },
      videoEffects: {
        videoCompress: "Compress video file",
        generateThumbnail: "Generate video thumbnail",
        videoPreview: "Create GIF preview",
      },
    }

    return NextResponse.json({
      effects: availableEffects,
      supportedFormats: {
        images: ["jpg", "jpeg", "png", "gif", "webp", "avif"],
        videos: ["mp4", "avi", "mov", "wmv", "flv", "webm"],
      },
    })
  } catch (error) {
    console.error("Media effects GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
