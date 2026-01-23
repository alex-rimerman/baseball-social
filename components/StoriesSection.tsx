"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Plus } from "lucide-react"

interface Story {
  id: string
  imageUrl: string
  videoUrl: string | null
  expiresAt: string
  createdAt: string
  viewed: boolean
  viewsCount: number
}

interface StoryUser {
  user: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
  stories: Story[]
}

export default function StoriesSection() {
  const { data: session } = useSession()
  const [stories, setStories] = useState<StoryUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchStories()
    }
  }, [session])

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/stories")
      if (response.ok) {
        const data = await response.json()
        setStories(data.stories || [])
      }
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
      <div className="flex space-x-4">
        {/* Your story */}
        {session && (
          <Link href="/stories/create" className="flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.username || "You"}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                      {session.user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-xs mt-1 text-gray-600 truncate max-w-[64px]">Your story</span>
            </div>
          </Link>
        )}

        {/* Other stories */}
        {stories.length === 0 ? (
          <div className="flex-1 text-center text-gray-500 text-sm py-4">
            No stories available. Follow more users to see their stories!
          </div>
        ) : (
          stories.map((storyUser) => (
            <Link
              key={storyUser.user.id}
              href={`/stories/${storyUser.user.username}`}
              className="flex-shrink-0"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full p-0.5 ${
                    storyUser.stories.some((s) => !s.viewed)
                      ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                      : "bg-gray-300"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                      {storyUser.user.image ? (
                        <Image
                          src={storyUser.user.image}
                          alt={storyUser.user.username}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                          {storyUser.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs mt-1 text-gray-600 truncate max-w-[64px]">
                  {storyUser.user.username}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}