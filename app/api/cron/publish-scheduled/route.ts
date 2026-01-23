import { NextResponse } from "next/server"
import { publishScheduledPosts } from "@/lib/scheduler"

export const dynamic = 'force-dynamic'

// This endpoint should be called by a cron job (e.g., Vercel Cron, or external service)
// Example: Call this every minute to check for scheduled posts
export async function GET(request: Request) {
  try {
    // Optional: Add authentication/authorization here
    // For example, check for a secret token in headers
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const result = await publishScheduledPosts()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}