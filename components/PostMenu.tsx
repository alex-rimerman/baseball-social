"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Trash2, Edit, Flag, Share2, Copy, X } from "lucide-react"
import EditPostModal from "./EditPostModal"

interface PostMenuProps {
  postId: string
  authorId: string
  onClose: () => void
  onEdit?: () => void
  onDeleted?: () => void
}

export default function PostMenu({ postId, authorId, onClose, onEdit, onDeleted }: PostMenuProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [post, setPost] = useState<any>(null)

  const isOwner = session?.user?.id === authorId

  useEffect(() => {
    if (showEdit) {
      fetchPost()
    }
  }, [showEdit])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      }
    } catch (error) {
      console.error("Error fetching post:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDeleted?.()
        onClose()
      } else {
        alert("Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Failed to delete post")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out this post",
          url: url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        await navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
      }
    }
    onClose()
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/posts/${postId}`
    await navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
    onClose()
  }

  const handleReport = async (reason: string) => {
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "post",
          postId,
          reason,
        }),
      })

      if (response.ok) {
        alert("Thank you for reporting. We'll review this content.")
        setShowReport(false)
        onClose()
      } else {
        alert("Failed to submit report")
      }
    } catch (error) {
      console.error("Error reporting post:", error)
      alert("Failed to submit report")
    }
  }

  if (showReport) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Report Post</h2>
            <button onClick={() => setShowReport(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {["Spam", "Harassment", "Inappropriate Content", "False Information", "Other"].map((reason) => (
              <button
                key={reason}
                onClick={() => handleReport(reason)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-2">
          {isOwner && (
            <>
              <button
                onClick={() => setShowEdit(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Post</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg text-red-600 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                <span>{isDeleting ? "Deleting..." : "Delete Post"}</span>
              </button>
            </>
          )}
          <button
            onClick={handleShare}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
          >
            <Copy className="w-5 h-5" />
            <span>Copy Link</span>
          </button>
          {!isOwner && (
            <button
              onClick={() => setShowReport(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg text-red-600"
            >
              <Flag className="w-5 h-5" />
              <span>Report</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 hover:bg-gray-100 rounded-lg mt-2 border-t border-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>

      {showEdit && post && (
        <EditPostModal
          post={post}
          onClose={() => {
            setShowEdit(false)
            onClose()
          }}
          onUpdated={() => {
            onEdit?.()
            router.refresh()
          }}
        />
      )}
    </div>
  )
}