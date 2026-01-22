import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export async function GET(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const hashtag = decodeURIComponent(params.tag)

    const posts = await prisma.post.findMany({
      where: {
        hashtags: { has: hashtag }
      },
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          }
        },
        likes: userId ? {
          where: { userId }
        } : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    })

    // Get hashtag stats
    const totalPosts = await prisma.post.count({
      where: {
        hashtags: { has: hashtag }
      }
    })

    const postsWithLiked = posts.map(post => ({
      ...post,
      isLiked: post.likes && post.likes.length > 0,
      likes: undefined,
    }))

    return NextResponse.json({
      hashtag,
      posts: postsWithLiked,
      totalPosts,
    })
  } catch (error) {
    console.error("Error fetching hashtag posts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}