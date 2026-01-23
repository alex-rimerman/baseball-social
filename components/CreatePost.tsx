"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Image as ImageIcon, Video, X, Hash } from "lucide-react"
import Image from "next/image"

interface CreatePostProps {
  onPostCreated?: () => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  if (!session) return null

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        setImageFile(file)
        setVideoFile(null)
        setVideoPreview(null)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith("video/")) {
        setVideoFile(file)
        setImageFile(null)
        setImagePreview(null)
        const reader = new FileReader()
        reader.onloadend = () => {
          setVideoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const removeMedia = () => {
    setImageFile(null)
    setVideoFile(null)
    setImagePreview(null)
    setVideoPreview(null)
  }

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g
    const matches = text.match(hashtagRegex)
    return matches ? matches.map(m => m.replace("#", "")) : []
  }

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const matches = text.match(mentionRegex)
    return matches ? matches.map(m => m.replace("@", "")) : []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !imageFile && !videoFile) return

    setSubmitting(true)
    setUploadError(null)

    try {
      let imageUrl: string | null = null
      let videoUrl: string | null = null

      if (imageFile) {
        // Check file size (max 10MB for images)
        if (imageFile.size > 10 * 1024 * 1024) {
          setUploadError("Image file is too large. Maximum size is 10MB.")
          setSubmitting(false)
          return
        }

        const formData = new FormData()
        formData.append("file", imageFile)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          let errorMessage = "Failed to upload image"
          try {
            const contentType = uploadResponse.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              const errorData = await uploadResponse.json()
              errorMessage = errorData.error || errorMessage
            } else {
              const text = await uploadResponse.text()
              console.error("Upload error response:", text)
              errorMessage = `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
            }
          } catch (e) {
            console.error("Error parsing upload response:", e)
            errorMessage = `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
          }
          throw new Error(errorMessage)
        }

        const uploadData = await uploadResponse.json()
        if (!uploadData.url) {
          throw new Error("No URL returned from upload")
        }
        imageUrl = uploadData.url
      }

      if (videoFile) {
        // Check file size (max 100MB for videos)
        if (videoFile.size > 100 * 1024 * 1024) {
          setUploadError("Video file is too large. Maximum size is 100MB.")
          setSubmitting(false)
          return
        }

        const formData = new FormData()
        formData.append("file", videoFile)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          let errorMessage = "Failed to upload video"
          try {
            const contentType = uploadResponse.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              const errorData = await uploadResponse.json()
              errorMessage = errorData.error || errorMessage
            } else {
              const text = await uploadResponse.text()
              console.error("Upload error response:", text)
              errorMessage = `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
            }
          } catch (e) {
            console.error("Error parsing upload response:", e)
            errorMessage = `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
          }
          throw new Error(errorMessage)
        }

        const uploadData = await uploadResponse.json()
        if (!uploadData.url) {
          throw new Error("No URL returned from upload")
        }
        videoUrl = uploadData.url
      }

      const hashtags = extractHashtags(content)
      const mentions = extractMentions(content)

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || null,
          imageUrl,
          videoUrl,
          hashtags,
          mentions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create post" }))
        throw new Error(errorData.error || "Failed to create post")
      }

      setContent("")
      removeMedia()
      setUploadError(null)
      onPostCreated?.()
    } catch (error) {
      console.error("Error creating post:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to create post. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border-b border-gray-200 mb-1">
      <div className="flex space-x-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {session.user?.name?.charAt(0) || session.user?.username?.charAt(0) || "U"}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in baseball today? #hashtag @mention"
          className="flex-1 min-h-[80px] border-0 focus:ring-0 resize-none text-sm placeholder-gray-400"
          disabled={submitting}
        />
      </div>

      {uploadError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {uploadError}
        </div>
      )}

      {(imagePreview || videoPreview) && (
        <div className="relative mb-4 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={removeMedia}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 z-10 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
          {imagePreview && (
            <Image
              src={imagePreview}
              alt="Preview"
              width={800}
              height={600}
              className="w-full h-auto max-h-96 object-contain"
              unoptimized
            />
          )}
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="w-full max-h-96"
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex space-x-4">
          <label className="cursor-pointer touch-manipulation">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={submitting}
            />
            <ImageIcon className="w-6 h-6 text-gray-900" />
          </label>
          <label className="cursor-pointer touch-manipulation">
            <input
              type="file"
              accept="video/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={submitting}
            />
            <Video className="w-6 h-6 text-gray-900" />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || (!content.trim() && !imageFile && !videoFile)}
          className="text-blue-500 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  )
}