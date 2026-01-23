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
    const userId = searchParams.get("userId")

    if (userId) {
      // Get conversation with specific user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: userId },
            { senderId: userId, receiverId: session.user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      })

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          receiverId: session.user.id,
          senderId: userId,
          read: false,
        },
        data: { read: true },
      })

      return NextResponse.json({ messages })
    } else {
      // Get all conversations
      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      // Group by conversation partner
      const conversationMap = new Map()
      conversations.forEach((message) => {
        const partnerId = message.senderId === session.user.id
          ? message.receiverId
          : message.senderId
        const partner = message.senderId === session.user.id
          ? message.receiver
          : message.sender

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user: partner,
            lastMessage: message,
            unreadCount: 0,
          })
        }

        const conv = conversationMap.get(partnerId)
        if (message.createdAt > conv.lastMessage.createdAt) {
          conv.lastMessage = message
        }
        if (
          message.receiverId === session.user.id &&
          !message.read
        ) {
          conv.unreadCount++
        }
      })

      return NextResponse.json({
        conversations: Array.from(conversationMap.values()),
      })
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
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

    const { receiverId, content, imageUrl } = await request.json()

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      )
    }

    // Check if receiver has blocked sender
    const isBlocked = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: receiverId,
          blockedId: session.user.id,
        },
      },
    })

    if (isBlocked) {
      return NextResponse.json(
        { error: "Cannot send message to this user" },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        imageUrl: imageUrl || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        type: "message",
        userId: receiverId,
        senderId: session.user.id,
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}