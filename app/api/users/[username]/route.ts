import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        favoriteTeam: true,
        favoritePlayer: true,
        location: true,
        isPrivate: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is blocked
    if (userId && userId !== user.id) {
      const isBlocked = await prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: user.id,
            blockedId: userId,
          },
        },
      })
      if (isBlocked) {
        return NextResponse.json(
          { error: "Cannot view this profile" },
          { status: 403 }
        )
      }
    }

    let isFollowing = false
    if (userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: user.id,
          }
        }
      })
      isFollowing = !!follow
    }

    return NextResponse.json({
      ...user,
      isFollowing,
      isOwnProfile: userId === user.id,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { username: params.username }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, bio, favoriteTeam, favoritePlayer, location, isPrivate } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(favoriteTeam !== undefined && { favoriteTeam }),
        ...(favoritePlayer !== undefined && { favoritePlayer }),
        ...(location !== undefined && { location }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        favoriteTeam: true,
        favoritePlayer: true,
        location: true,
        isPrivate: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { username: params.username }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: user.id }
    })

    return NextResponse.json({ message: "Account deleted" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}