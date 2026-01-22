import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

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

    const post = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Check if already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.id
        }
      }
    })

    if (existingSave) {
      // Unsave
      await prisma.savedPost.delete({
        where: { id: existingSave.id }
      })

      return NextResponse.json({ saved: false })
    } else {
      // Save
      await prisma.savedPost.create({
        data: {
          userId: session.user.id,
          postId: params.id
        }
      })

      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error("Error toggling save:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}