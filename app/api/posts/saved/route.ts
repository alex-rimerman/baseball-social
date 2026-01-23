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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get blocked users
    const blocks = await prisma.block.findMany({
      where: { blockerId: session.user.id },
      select: { blockedId: true },
    })
    const blockedUserIds = blocks.map((b) => b.blockedId)

    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId: session.user.id,
        post: {
          isArchived: false,
          scheduledFor: null,
          authorId: blockedUserIds.length > 0 ? { notIn: blockedUserIds } : undefined,
        },
      },
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              }
            },
            likes: {
              where: { userId: session.user.id }
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              }
            }
          }
        }
      }
    })

    const posts = savedPosts.map(sp => ({
      ...sp.post,
      isLiked: sp.post.likes && sp.post.likes.length > 0,
      isSaved: true,
      likes: undefined,
    }))

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching saved posts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}