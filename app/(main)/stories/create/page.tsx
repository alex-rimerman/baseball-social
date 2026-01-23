"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, X } from "lucide-react"
import Image from "next/image"

export default function CreateStoryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async () => {
    if (!imageFile && !videoFile) return

    setSubmitting(true)
    setError(null)

    try {
      let imageUrl: string | null = null
      let videoUrl: string | null = null

      const fileToUpload = imageFile || videoFile!
      const formData = new FormData()
      formData.append("file", fileToUpload)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload media")
      }

      const uploadData = await uploadResponse.json()
      if (imageFile) {
        imageUrl = uploadData.url
      } else {
        videoUrl = uploadData.url
      }

      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, videoUrl }),
      })

      if (response.ok) {
        router.push("/")
      } else {
        throw new Error("Failed to create story")
      }
    } catch (error) {
      console.error("Error creating story:", error)
      setError(error instanceof Error ? error.message : "Failed to create story")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold">Create Story</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-20 pb-32">
        {!imagePreview && !videoPreview ? (
          <>
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold text-white">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              Choose Photo or Video
            </label>
            <p className="text-gray-400 text-sm mt-4">Stories last 24 hours</p>
          </>
        ) : (
          <>
            <div className="relative w-full max-w-md aspect-[9/16] mb-6">
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Story preview"
                  fill
                  className="object-contain rounded-lg"
                  unoptimized
                />
              )}
              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full rounded-lg object-contain"
                />
              )}
              <button
                onClick={() => {
                  setImagePreview(null)
                  setVideoPreview(null)
                  setImageFile(null)
                  setVideoFile(null)
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-2 z-20 hover:bg-opacity-90"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 max-w-md w-full text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg z-10 relative"
            >
              {submitting ? "Sharing..." : "Share Story"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}