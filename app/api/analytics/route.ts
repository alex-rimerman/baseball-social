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

    // Get basic stats
    const [totalPosts, totalLikes, totalComments, followers, following] = await Promise.all([
      prisma.post.count({ where: { authorId: userId, isArchived: false } }),
      prisma.like.count({
        where: { post: { authorId: userId, isArchived: false } },
      }),
      prisma.comment.count({
        where: { post: { authorId: userId, isArchived: false } },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ])

    // Get weekly stats
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [postsThisWeek, likesThisWeek] = await Promise.all([
      prisma.post.count({
        where: {
          authorId: userId,
          createdAt: { gte: weekAgo },
          isArchived: false,
        },
      }),
      prisma.like.count({
        where: {
          post: {
            authorId: userId,
            createdAt: { gte: weekAgo },
            isArchived: false,
          },
        },
      }),
    ])

    // Get top posts
    const topPosts = await prisma.post.findMany({
      where: { authorId: userId, isArchived: false },
      orderBy: [
        { likes: { _count: "desc" } },
        { comments: { _count: "desc" } },
      ],
      take: 5,
      select: {
        id: true,
        content: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return NextResponse.json({
      totalPosts,
      totalLikes,
      totalComments,
      totalViews: 0, // Can be implemented with view tracking
      followers,
      following,
      postsThisWeek,
      likesThisWeek,
      topPosts: topPosts.map((post) => ({
        id: post.id,
        content: post.content,
        likes: post._count.likes,
        comments: post._count.comments,
      })),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}