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
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"
    const sortBy = searchParams.get("sortBy") || "recent"
    const minLikes = searchParams.get("minLikes")
    const hashtag = searchParams.get("hashtag")
    const location = searchParams.get("location")
    const favoriteTeam = searchParams.get("favoriteTeam")

    if (type === "users") {
      const where: any = {}

      if (query) {
        where.OR = [
          { username: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
        ]
      }

      if (location) {
        where.location = { contains: location, mode: "insensitive" as const }
      }

      if (favoriteTeam) {
        where.favoriteTeam = { contains: favoriteTeam, mode: "insensitive" as const }
      }

      const users = await prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
        take: 50,
      })

      return NextResponse.json({ users })
    }

    if (type === "posts") {
      const where: any = {
        isArchived: false,
      }

      if (query) {
        where.content = { contains: query, mode: "insensitive" as const }
      }

      if (hashtag) {
        where.hashtags = { has: hashtag }
      }

      if (minLikes) {
        where.likes = {
          some: {},
        }
      }

      const orderBy: any = {}
      if (sortBy === "popular") {
        orderBy.likes = { _count: "desc" }
      } else {
        orderBy.createdAt = "desc"
      }

      const posts = await prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy,
        take: 50,
      })

      // Filter by min likes if specified
      let filteredPosts = posts
      if (minLikes) {
        const min = parseInt(minLikes)
        filteredPosts = posts.filter((p) => p._count.likes >= min)
      }

      return NextResponse.json({ posts: filteredPosts })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error in advanced search:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}