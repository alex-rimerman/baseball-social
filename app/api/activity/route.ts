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

    const userId = session.user.id
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Get recent likes on user's posts
    const recentLikes = await prisma.like.count({
      where: {
        post: {
          authorId: userId,
          createdAt: { gte: twentyFourHoursAgo },
        },
      },
    })

    // Get recent comments on user's posts
    const recentComments = await prisma.comment.count({
      where: {
        post: {
          authorId: userId,
          createdAt: { gte: twentyFourHoursAgo },
        },
      },
    })

    // Get new followers
    const newFollowers = await prisma.follow.count({
      where: {
        followingId: userId,
        createdAt: { gte: twentyFourHoursAgo },
      },
    })

    // Get top engaged posts
    const topPosts = await prisma.post.findMany({
      where: {
        authorId: userId,
        isArchived: false,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: [
        { likes: { _count: "desc" } },
        { comments: { _count: "desc" } },
      ],
      take: 5,
      select: {
        id: true,
        content: true,
        imageUrl: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    const postsEngagement = recentLikes + recentComments

    return NextResponse.json({
      recentLikes,
      recentComments,
      newFollowers,
      postsEngagement,
      topEngagedPosts: topPosts.map((post) => ({
        id: post.id,
        content: post.content,
        likes: post._count.likes,
        comments: post._count.comments,
        imageUrl: post.imageUrl,
      })),
    })
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}