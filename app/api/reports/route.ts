import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { type, postId, userId, reason } = await request.json()

    if (!type || !reason) {
      return NextResponse.json(
        { error: "Type and reason are required" },
        { status: 400 }
      )
    }

    if (type === "post" && !postId) {
      return NextResponse.json(
        { error: "Post ID is required for post reports" },
        { status: 400 }
      )
    }

    if (type === "user" && !userId) {
      return NextResponse.json(
        { error: "User ID is required for user reports" },
        { status: 400 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        type,
        postId: postId || null,
        userId: userId || null,
        reason,
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}