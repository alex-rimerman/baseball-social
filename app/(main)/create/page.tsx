"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
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
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <CreatePost
        onPostCreated={() => {
          router.push("/")
        }}
      />
    </div>
  )
}