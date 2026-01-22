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

    try {
      let imageUrl: string | null = null
      let videoUrl: string | null = null

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      if (videoFile) {
        const formData = new FormData()
        formData.append("file", videoFile)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const uploadData = await uploadResponse.json()
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

      if (response.ok) {
        setContent("")
        removeMedia()
        onPostCreated?.()
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-6">
      <div className="flex space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {session.user?.name?.charAt(0) || session.user?.username?.charAt(0) || "U"}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in baseball today? #hashtag @mention"
          className="flex-1 min-h-[100px] input-field resize-none"
          disabled={submitting}
        />
      </div>

      {(imagePreview || videoPreview) && (
        <div className="relative mb-4 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={removeMedia}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 z-10"
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

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={submitting}
            />
            <ImageIcon className="w-5 h-5 text-gray-600 hover:text-primary-600 transition-colors" />
          </label>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={submitting}
            />
            <Video className="w-5 h-5 text-gray-600 hover:text-primary-600 transition-colors" />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || (!content.trim() && !imageFile && !videoFile)}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  )
}