"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Image from "next/image"

interface EditPostModalProps {
  post: {
    id: string
    content: string | null
    imageUrl: string | null
    videoUrl: string | null
  }
  onClose: () => void
  onUpdated: () => void
}

export default function EditPostModal({ post, onClose, onUpdated }: EditPostModalProps) {
  const [content, setContent] = useState(post.content || "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        onUpdated()
        onClose()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to update post")
      }
    } catch (error) {
      console.error("Error updating post:", error)
      setError(error instanceof Error ? error.message : "Failed to update post")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Post</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full min-h-[200px] border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          {(post.imageUrl || post.videoUrl) && (
            <div className="mt-4 relative w-full aspect-square max-h-96">
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt="Post"
                  fill
                  className="object-contain rounded-lg"
                  unoptimized
                />
              ) : post.videoUrl ? (
                <video
                  src={post.videoUrl}
                  controls
                  className="w-full h-full rounded-lg object-contain"
                />
              ) : null}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}