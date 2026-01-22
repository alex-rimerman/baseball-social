"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

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
    <div className="mt-4 pt-4 border-t border-gray-200">
      {session && (
        <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 input-field"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
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
                <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {comment.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="font-semibold text-sm">{comment.user.name || comment.user.username}</p>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 text-sm">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}