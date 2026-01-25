"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, X } from "lucide-react"
import Image from "next/image"

export default function CreateStoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    )
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

  // Upload directly to Cloudinary (bypasses Vercel's 4.5MB limit)
  const uploadToCloudinaryDirect = async (file: File): Promise<string> => {
    try {
      // Get upload signature from our API
      const signatureResponse = await fetch("/api/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType: file.type, fileName: file.name }),
      })

      if (!signatureResponse.ok) {
        const errorText = await signatureResponse.text().catch(() => "Unknown error")
        console.error("Signature API error:", signatureResponse.status, errorText)
        throw new Error(`Failed to get upload signature: ${signatureResponse.status}`)
      }

      const signatureData = await signatureResponse.json()
      
      if (!signatureData.signature || !signatureData.cloudName || !signatureData.apiKey) {
        console.error("Invalid signature response:", signatureData)
        throw new Error("Invalid signature response from server")
      }

      const { signature, timestamp, cloudName, apiKey, folder, resourceType } = signatureData

      // Upload directly to Cloudinary
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("api_key", apiKey)
      uploadFormData.append("timestamp", timestamp.toString())
      uploadFormData.append("signature", signature)
      uploadFormData.append("folder", folder)
      uploadFormData.append("resource_type", resourceType)

      if (resourceType === "video") {
        uploadFormData.append("eager", "mp4")
        uploadFormData.append("eager_async", "false")
      }

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      )

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json().catch(() => ({}))
        console.error("Cloudinary upload error:", errorData)
        throw new Error(errorData.error?.message || `Cloudinary upload failed: ${cloudinaryResponse.status}`)
      }

      const result = await cloudinaryResponse.json()
      if (!result.secure_url) {
        throw new Error("No URL returned from Cloudinary")
      }
      return result.secure_url
    } catch (error) {
      console.error("Upload error:", error)
      throw error
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
      
      // Always use direct Cloudinary upload for stories (they can be large)
      const uploadedUrl = await uploadToCloudinaryDirect(fileToUpload)
      
      if (imageFile) {
        imageUrl = uploadedUrl
      } else {
        videoUrl = uploadedUrl
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