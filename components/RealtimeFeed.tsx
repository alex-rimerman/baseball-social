"use client"

import { useEffect, useRef } from "react"
import PostCard from "./PostCard"

interface Post {
  id: string
  content: string | null
  imageUrl: string | null
  videoUrl: string | null
  hashtags: string[]
  mentions: string[]
  author: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
  isLiked: boolean
  _count: {
    likes: number
    comments: number
  }
  createdAt: string
}

interface RealtimeFeedProps {
  posts: Post[]
  onPostsUpdate: (posts: Post[]) => void
}

export default function RealtimeFeed({ posts, onPostsUpdate }: RealtimeFeedProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Poll for new posts every 30 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/posts?page=1&limit=10")
        if (response.ok) {
          const data = await response.json()
          // Only update if there are new posts
          if (data.posts && data.posts.length > 0) {
            const newPostIds = new Set(data.posts.map((p: Post) => p.id))
            const currentPostIds = new Set(posts.map((p) => p.id))
            const hasNewPosts = data.posts.some((p: Post) => !currentPostIds.has(p.id))
            
            if (hasNewPosts) {
              // Merge new posts with existing, avoiding duplicates
              const merged = [
                ...data.posts.filter((p: Post) => !currentPostIds.has(p.id)),
                ...posts,
              ].slice(0, 50) // Keep last 50 posts
              onPostsUpdate(merged)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching new posts:", error)
      }
    }, 30000) // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [posts, onPostsUpdate])

  return null // This component doesn't render anything, it just handles polling

  return null // This component doesn't render anything, it just handles polling
}