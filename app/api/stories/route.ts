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

    // Get stories from users you follow, plus your own stories
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    })

    const followingIds = following.map((f) => f.followingId)
    const userIds = [...followingIds, session.user.id]

    // Get active stories (not expired)
    const stories = await prisma.story.findMany({
      where: {
        userId: { in: userIds },
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        views: {
          where: { userId: session.user.id },
          select: { id: true },
        },
        _count: {
          select: { views: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Group stories by user
    const storiesByUser = stories.reduce((acc, story) => {
      if (!acc[story.userId]) {
        acc[story.userId] = {
          user: story.user,
          stories: [],
        }
      }
      acc[story.userId].stories.push({
        id: story.id,
        imageUrl: story.imageUrl,
        videoUrl: story.videoUrl,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
        viewed: story.views.length > 0,
        viewsCount: story._count.views,
      })
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      stories: Object.values(storiesByUser),
    })
  } catch (error) {
    console.error("Error fetching stories:", error)
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

    const { imageUrl, videoUrl } = await request.json()

    if (!imageUrl && !videoUrl) {
      return NextResponse.json(
        { error: "Image or video URL is required" },
        { status: 400 }
      )
    }

    // Stories expire after 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const story = await prisma.story.create({
      data: {
        userId: session.user.id,
        imageUrl: imageUrl || "",
        videoUrl: videoUrl || null,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ story })
  } catch (error) {
    console.error("Error creating story:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}