import { prisma } from "@/prisma/client"

// This function should be called periodically (e.g., via a cron job or scheduled task)
// to publish scheduled posts when their time arrives
export async function publishScheduledPosts() {
  try {
    const now = new Date()
    
    // Find posts that are scheduled and their time has arrived
    const scheduledPosts = await prisma.post.findMany({
      where: {
        scheduledFor: {
          lte: now,
          not: null,
        },
        isArchived: false,
      },
    })

    // Update posts to remove scheduledFor (making them published)
    for (const post of scheduledPosts) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          scheduledFor: null,
        },
      })
    }

    return { published: scheduledPosts.length }
  } catch (error) {
    console.error("Error publishing scheduled posts:", error)
    throw error
  }
}