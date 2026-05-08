import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

// Credit costs per operation
export const CREDIT_COSTS = {
  upload: 1,
  removeBackground: 5,
  autoEnhance: 2,
  generateThumbnail: 1,
  videoCompress: 3,
  autoCompress: 1,
  artisticEffect: 2,
  default: 1,
} as const

const FREE_CREDITS = 20
const RESET_DAYS = 30

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = user.publicMetadata as any

    const credits = meta.credits ?? FREE_CREDITS
    const creditsUsed = meta.creditsUsed ?? 0
    const lastReset = meta.lastReset ? new Date(meta.lastReset) : new Date()

    // Auto-reset credits after RESET_DAYS
    const daysSinceReset = Math.floor(
      (Date.now() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceReset >= RESET_DAYS) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...meta,
          credits: FREE_CREDITS,
          creditsUsed: 0,
          lastReset: new Date().toISOString(),
        },
      })
      return NextResponse.json({
        credits: FREE_CREDITS,
        creditsUsed: 0,
        plan: meta.plan || "free",
        resetDate: new Date(Date.now() + RESET_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        costs: CREDIT_COSTS,
      })
    }

    return NextResponse.json({
      credits,
      creditsUsed,
      plan: meta.plan || "free",
      resetDate: new Date(lastReset.getTime() + RESET_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      costs: CREDIT_COSTS,
    })
  } catch (error) {
    console.error("Credits GET error:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { operation } = await request.json()
    const cost = CREDIT_COSTS[operation as keyof typeof CREDIT_COSTS] ?? CREDIT_COSTS.default

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = user.publicMetadata as any

    const currentCredits = meta.credits ?? FREE_CREDITS
    const currentUsed = meta.creditsUsed ?? 0

    if (currentCredits < cost) {
      return NextResponse.json(
        { error: "Insufficient credits", credits: currentCredits, required: cost },
        { status: 402 }
      )
    }

    const newCredits = currentCredits - cost
    const newUsed = currentUsed + cost

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...meta,
        credits: newCredits,
        creditsUsed: newUsed,
        lastReset: meta.lastReset || new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      credits: newCredits,
      creditsUsed: newUsed,
      deducted: cost,
      operation,
    })
  } catch (error) {
    console.error("Credits POST error:", error)
    return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 })
  }
}