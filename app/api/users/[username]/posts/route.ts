import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const user = await prisma.user.findUnique({
      where: { username: params.username }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
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

    const postsWithLiked = posts.map(post => ({
      ...post,
      isLiked: post.likes && post.likes.length > 0,
      likes: undefined,
    }))

    return NextResponse.json({ posts: postsWithLiked })
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}