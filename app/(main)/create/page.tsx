"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import CreatePost from "@/components/CreatePost"

export default function CreatePage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
    }
  }, [session, router])

  if (!session) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-sm">Create Post</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <CreatePost
        onPostCreated={() => {
          router.push("/")
        }}
      />
    </div>
  )
}