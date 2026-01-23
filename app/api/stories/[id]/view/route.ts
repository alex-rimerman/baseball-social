import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export const dynamic = 'force-dynamic'

export async function POST(
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

    const storyId = params.id

    // Check if already viewed
    const existingView = await prisma.storyView.findUnique({
      where: {
        storyId_userId: {
          storyId,
          userId: session.user.id,
        },
      },
    })

    if (!existingView) {
      await prisma.storyView.create({
        data: {
          storyId,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({ viewed: true })
  } catch (error) {
    console.error("Error viewing story:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}