import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Check if user is blocked by post author
    let canView = true
    if (userId) {
      const postCheck = await prisma.post.findUnique({
        where: { id: params.id },
        select: { authorId: true },
      })
      
      if (postCheck) {
        const isBlocked = await prisma.block.findUnique({
          where: {
            blockerId_blockedId: {
              blockerId: postCheck.authorId,
              blockedId: userId,
            },
          },
        })
        if (isBlocked) {
          canView = false
        }
      }
    }

    if (!canView) {
      return NextResponse.json(
        { error: "Cannot view this post" },
        { status: 403 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
        comments: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              }
            }
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

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    const postWithLiked = {
      ...post,
      isLiked: post.likes && post.likes.length > 0,
      isSaved: post.savedBy && post.savedBy.length > 0,
      likes: undefined,
      savedBy: undefined,
    }

    return NextResponse.json({ post: postWithLiked })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Post deleted" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { content, imageUrl, videoUrl } = await request.json()

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        content: content !== undefined ? content : post.content,
        imageUrl: imageUrl !== undefined ? imageUrl : post.imageUrl,
        videoUrl: videoUrl !== undefined ? videoUrl : post.videoUrl,
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

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}