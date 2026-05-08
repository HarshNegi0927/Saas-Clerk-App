import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let history: any[] = []

    try {
      history = await (prisma as any).transformationHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    } catch (e: any) {
      // Table doesn't exist yet — tell the frontend clearly
      console.warn("TransformationHistory table missing:", e.message)
      return NextResponse.json({
        history: [],
        warning: "Run: npx prisma migrate dev --name add_transformation_history"
      })
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error("History GET error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { publicId, originalUrl, transformedUrl, effects, mediaType } = body

    if (!publicId || !transformedUrl || !effects?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let record: any = null

    try {
      record = await (prisma as any).transformationHistory.create({
        data: {
          userId,
          publicId,
          originalUrl: originalUrl || "",
          transformedUrl,
          effects,
          mediaType: mediaType || "image",
        },
      })
    } catch (e: any) {
      console.warn("Could not save history:", e.message)
      // Don't fail the transformation if history save fails
      return NextResponse.json({
        success: true,
        warning: "History not saved — run prisma migrate",
      })
    }

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error("History POST error:", error)
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}