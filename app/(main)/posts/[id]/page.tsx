"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import PostCard from "@/components/PostCard"
import CommentSection from "@/components/CommentSection"

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
  isSaved?: boolean
  _count: {
    likes: number
    comments: number
  }
  createdAt: string
}

export default function PostDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError("Post not found")
        } else {
          setError("Failed to load post")
        }
        return
      }
      const data = await response.json()
      setPost(data.post)
    } catch (error) {
      console.error("Error fetching post:", error)
      setError("Failed to load post")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">Loading post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go back</span>
        </button>
        <div className="card text-center text-gray-500 py-12">
          <p className="text-lg font-semibold mb-2">{error || "Post not found"}</p>
          <p className="text-sm">This post may have been deleted or doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <PostCard post={post} />
      
      {/* Comments are always shown on detail page */}
      <div className="mt-4">
        <CommentSection
          postId={post.id}
          onCommentAdded={() => {
            // Refresh post to update comment count
            fetchPost()
          }}
        />
      </div>
    </div>
  )
}