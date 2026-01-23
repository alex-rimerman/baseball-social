import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export const dynamic = 'force-dynamic'

export async function POST(
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

    const username = params.username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      )
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: user.id,
        },
      },
    })

    if (existingBlock) {
      // Unblock
      await prisma.block.delete({
        where: { id: existingBlock.id },
      })
      return NextResponse.json({ blocked: false })
    } else {
      // Block
      await prisma.block.create({
        data: {
          blockerId: session.user.id,
          blockedId: user.id,
        },
      })
      // Also unfollow if following
      await prisma.follow.deleteMany({
        where: {
          followerId: session.user.id,
          followingId: user.id,
        },
      })
      return NextResponse.json({ blocked: true })
    }
  } catch (error) {
    console.error("Error blocking/unblocking user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}