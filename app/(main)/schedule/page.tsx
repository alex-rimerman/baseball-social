"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, X } from "lucide-react"
import Image from "next/image"

interface ScheduledPost {
  id: string
  content: string | null
  imageUrl: string | null
  videoUrl: string | null
  scheduledFor: string
  createdAt: string
}

export default function SchedulePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (session) {
      fetchScheduledPosts()
    }
  }, [session])

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch("/api/posts/scheduled")
      if (response.ok) {
        const data = await response.json()
        setScheduledPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Error fetching scheduled posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledDate || !scheduledTime) {
      alert("Please select date and time")
      return
    }

    setSubmitting(true)
    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)

      const response = await fetch("/api/posts/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || null,
          imageUrl,
          scheduledFor: scheduledDateTime.toISOString(),
        }),
      })

      if (response.ok) {
        setContent("")
        setImageFile(null)
        setImagePreview(null)
        setScheduledDate("")
        setScheduledTime("")
        setShowCreate(false)
        fetchScheduledPosts()
      }
    } catch (error) {
      console.error("Error scheduling post:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this scheduled post?")) return

    try {
      const response = await fetch(`/api/posts/scheduled/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchScheduledPosts()
      }
    } catch (error) {
      console.error("Error deleting scheduled post:", error)
    }
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-12 text-gray-500">Please sign in</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Scheduled Posts
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Schedule Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : scheduledPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No scheduled posts</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(post.scheduledFor).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {post.content && <p className="text-sm mb-2">{post.content}</p>}
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt="Scheduled post"
                  width={400}
                  height={400}
                  className="rounded-lg"
                  unoptimized
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Schedule Post</h2>
              <button onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full min-h-[200px] border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              />

              <label className="block mb-2">
                <span className="text-sm text-gray-600 mb-1 block">Image (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </label>

              {imagePreview && (
                <div className="relative mb-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={400}
                    className="rounded-lg"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? "Scheduling..." : "Schedule Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}