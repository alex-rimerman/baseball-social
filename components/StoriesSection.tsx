"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Plus } from "lucide-react"

interface StoryUser {
  id: string
  username: string
  name: string | null
  image: string | null
}

export default function StoriesSection() {
  const { data: session } = useSession()
  const [stories, setStories] = useState<StoryUser[]>([])

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/explore?type=suggested")
      const data = await response.json()
      setStories(data.suggestedUsers?.slice(0, 8) || [])
    } catch (error) {
      console.error("Error fetching stories:", error)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
      <div className="flex space-x-4">
        {/* Your story */}
        {session && (
          <Link href={`/profile/${session.user?.username}`} className="flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
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
                </div>
              </div>
              <span className="text-xs mt-1 text-gray-600 truncate max-w-[64px]">Your story</span>
            </div>
          </Link>
        )}

        {/* Other stories */}
        {stories.map((user) => (
          <Link key={user.id} href={`/profile/${user.username}`} className="flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.username}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs mt-1 text-gray-600 truncate max-w-[64px]">
                {user.username}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}