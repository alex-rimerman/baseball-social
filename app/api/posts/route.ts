import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const posts = await prisma.post.findMany({
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
        savedBy: userId ? {
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

    const postsWithLiked = posts.map(post => ({
      ...post,
      isLiked: post.likes && post.likes.length > 0,
      isSaved: post.savedBy && post.savedBy.length > 0,
      likes: undefined,
      savedBy: undefined,
    }))

    return NextResponse.json({ posts: postsWithLiked })
  } catch (error) {
    console.error("Error fetching posts:", error)
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

    const body = await request.json()
    const { content, imageUrl, videoUrl, hashtags, mentions } = body

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        videoUrl,
        hashtags: hashtags || [],
        mentions: mentions || [],
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    })

    // Create notifications for mentions
    if (mentions && mentions.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          username: { in: mentions }
        }
      })

      await prisma.notification.createMany({
        data: mentionedUsers
          .filter(user => user.id !== session.user.id)
          .map(user => ({
            type: "mention",
            userId: user.id,
            senderId: session.user.id,
            postId: post.id,
          }))
      })
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}