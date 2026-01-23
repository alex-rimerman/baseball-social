import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Get blocked users
    let blockedUserIds: string[] = []
    if (userId) {
      const blocks = await prisma.block.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      })
      blockedUserIds = blocks.map((b) => b.blockedId)
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "recommended" // recommended, trending, suggested

    if (type === "trending") {
      // Get trending hashtags (most used in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentPosts = await prisma.post.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          isArchived: false,
          scheduledFor: null,
          authorId: blockedUserIds.length > 0 ? { notIn: blockedUserIds } : undefined,
        },
        select: {
          hashtags: true
        }
      })

      // Count hashtag occurrences
      const hashtagCounts: Record<string, number> = {}
      recentPosts.forEach(post => {
        post.hashtags.forEach(tag => {
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1
        })
      })

      const trendingHashtags = Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }))

      // Get trending posts (most liked/commented in last 7 days)
      const trendingPosts = await prisma.post.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          isArchived: false,
          scheduledFor: null,
          authorId: blockedUserIds.length > 0 ? { notIn: blockedUserIds } : undefined,
        },
        take: 20,
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

      const postsWithLiked = trendingPosts.map(post => ({
        ...post,
        isLiked: post.likes && post.likes.length > 0,
        likes: undefined,
        engagement: post._count.likes + post._count.comments * 2, // Weight comments higher
      })).sort((a, b) => b.engagement - a.engagement).slice(0, 10)

      return NextResponse.json({
        trendingHashtags,
        trendingPosts: postsWithLiked,
      })
    }

    if (type === "suggested") {
      if (!userId) {
        return NextResponse.json({ suggestedUsers: [] })
      }

      // Get users that the current user doesn't follow
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
      })

      const followingIds = following.map(f => f.followingId)
      followingIds.push(userId) // Exclude self

      // Get user's preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          favoriteTeam: true,
          location: true,
        }
      })

      // Find users with similar interests or location
      const suggestedUsers = await prisma.user.findMany({
        where: {
          id: { notIn: [...followingIds, ...blockedUserIds] },
          OR: [
            ...(user?.favoriteTeam ? [{ favoriteTeam: user.favoriteTeam }] : []),
            ...(user?.location ? [{ location: { contains: user.location, mode: "insensitive" as const } }] : []),
          ]
        },
        take: 10,
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          bio: true,
          favoriteTeam: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            }
          }
        },
        orderBy: {
          followers: {
            _count: "desc"
          }
        }
      })

      return NextResponse.json({ suggestedUsers })
    }

    // Default: recommended posts based on user preferences
    if (!userId) {
      // For non-logged in users, return trending posts
      const recentPosts = await prisma.post.findMany({
        where: {
          isArchived: false,
          scheduledFor: null,
        },
        take: 20,
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
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          }
        }
      })

      return NextResponse.json({ posts: recentPosts })
    }

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        favoriteTeam: true,
        favoritePlayer: true,
        following: {
          select: { followingId: true }
        }
      }
    })

    const followingIds = user?.following.map(f => f.followingId) || []

    // Get recommended posts:
    // 1. Posts from users you follow (highest priority)
    // 2. Posts with your favorite team/player mentioned
    // 3. Posts with hashtags related to your interests

    const followingPosts = await prisma.post.findMany({
      where: {
        authorId: { in: followingIds },
        isArchived: false,
        scheduledFor: null,
      },
      take: 10,
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
        likes: {
          where: { userId }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    })

    // Get posts with favorite team/player mentions
    const teamPlayerPosts = user?.favoriteTeam || user?.favoritePlayer
      ? await prisma.post.findMany({
          where: {
            authorId: { notIn: [...followingIds, userId, ...blockedUserIds] },
            isArchived: false,
            scheduledFor: null,
            OR: [
              ...(user.favoriteTeam ? [
                { content: { contains: user.favoriteTeam, mode: "insensitive" as const } },
                { hashtags: { has: user.favoriteTeam.replace(/\s+/g, "") } }
              ] : []),
              ...(user.favoritePlayer ? [
                { content: { contains: user.favoritePlayer, mode: "insensitive" as const } },
                { hashtags: { has: user.favoritePlayer.replace(/\s+/g, "") } }
              ] : []),
            ]
          },
          take: 10,
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
            likes: {
              where: { userId }
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              }
            }
          }
        })
      : []

    // Combine and deduplicate
    const allPostIds = new Set([...followingPosts, ...teamPlayerPosts].map(p => p.id))
    const recommendedPosts = [...followingPosts, ...teamPlayerPosts]
      .filter((post, index, self) => index === self.findIndex(p => p.id === post.id))
      .map(post => ({
        ...post,
        isLiked: post.likes && post.likes.length > 0,
        likes: undefined,
      }))

    return NextResponse.json({ posts: recommendedPosts })
  } catch (error) {
    console.error("Error fetching explore:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}