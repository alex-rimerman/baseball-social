import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
        scheduledFor: { not: null },
        isArchived: false,
      },
      orderBy: { scheduledFor: "asc" },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        videoUrl: true,
        scheduledFor: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching scheduled posts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { content, imageUrl, videoUrl, scheduledFor } = await request.json()

    if (!scheduledFor) {
      return NextResponse.json(
        { error: "Scheduled date is required" },
        { status: 400 }
      )
    }

    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled date must be in the future" },
        { status: 400 }
      )
    }

    // Extract hashtags and mentions
    const hashtagRegex = /#(\w+)/g
    const mentionRegex = /@(\w+)/g
    const hashtags = content?.match(hashtagRegex)?.map((h: string) => h.replace("#", "")) || []
    const mentions = content?.match(mentionRegex)?.map((m: string) => m.replace("@", "")) || []

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        content: content?.trim() || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        hashtags,
        mentions,
        scheduledFor: scheduledDate,
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error scheduling post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}