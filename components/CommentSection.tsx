"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

interface Comment {
  id: string
  content: string
  user: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
  createdAt: string
}

interface CommentSectionProps {
  postId: string
  onCommentAdded?: () => void
}

export default function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      const data = await response.json()
      setComments(data.comments)
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })

      const data = await response.json()
      if (data.comment) {
        setComments([data.comment, ...comments])
        setNewComment("")
        onCommentAdded?.()
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="mt-4 text-center text-gray-500">Loading comments...</div>
  }

  return (
    <div>
      {session && (
        <form onSubmit={handleSubmit} className="flex items-center border-t border-gray-200 py-2 px-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border-0 focus:ring-0 text-sm placeholder-gray-400"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="text-blue-500 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed ml-2"
          >
            Post
          </button>
        </form>
      )}

      <div className="space-y-3 px-4 py-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <Link
              href={`/profile/${comment.user.username}`}
              className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0"
            >
              {comment.user.image ? (
                <Image
                  src={comment.user.image}
                  alt={comment.user.username}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {comment.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div className="flex-1">
              <div>
                <Link
                  href={`/profile/${comment.user.username}`}
                  className="font-semibold text-sm mr-2"
                >
                  {comment.user.username}
                </Link>
                <span className="text-sm">{comment.content}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}