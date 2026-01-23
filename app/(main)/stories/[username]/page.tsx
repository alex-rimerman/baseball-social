"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { X } from "lucide-react"
import Image from "next/image"
import ReactPlayer from "react-player"

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

export default function StoryViewPage() {
  const { username } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [storiesData, setStoriesData] = useState<StoryUser[]>([])
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
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
        setStoriesData(data.stories || [])
        
        // Find the user's stories
        const userIndex = data.stories.findIndex(
          (s: StoryUser) => s.user.username === username
        )
        if (userIndex !== -1) {
          setCurrentUserIndex(userIndex)
          setCurrentStoryIndex(0)
        }
      }
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentUser = storiesData[currentUserIndex]
  const currentStory = currentUser?.stories[currentStoryIndex]

  useEffect(() => {
    if (currentStory && !currentStory.viewed) {
      // Mark as viewed
      fetch(`/api/stories/${currentStory.id}/view`, { method: "POST" })
    }
  }, [currentStory])

  const nextStory = () => {
    if (currentUser && currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
    } else if (currentUserIndex < storiesData.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1)
      setCurrentStoryIndex(0)
    } else {
      router.push("/")
    }
  }

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1)
      const prevUser = storiesData[currentUserIndex - 1]
      setCurrentStoryIndex(prevUser.stories.length - 1)
    }
  }

  if (loading || !currentStory) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  const progress = ((currentStoryIndex + 1) / currentUser.stories.length) * 100

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-20">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Story content */}
      <div className="relative w-full h-screen">
        {currentStory.videoUrl ? (
          <ReactPlayer
            url={currentStory.videoUrl}
            playing
            width="100%"
            height="100%"
            onEnded={nextStory}
          />
        ) : (
          <Image
            src={currentStory.imageUrl}
            alt="Story"
            fill
            className="object-contain"
            unoptimized
          />
        )}

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {currentUser.user.image ? (
                <Image
                  src={currentUser.user.image}
                  alt={currentUser.user.username}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {currentUser.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{currentUser.user.username}</p>
              <p className="text-xs text-gray-300">
                {new Date(currentStory.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <button onClick={() => router.push("/")} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <button
          onClick={prevStory}
          className="absolute left-0 top-0 bottom-0 w-1/4 z-10"
          aria-label="Previous story"
        />
        <button
          onClick={nextStory}
          className="absolute right-0 top-0 bottom-0 w-1/4 z-10"
          aria-label="Next story"
        />

        {/* Story indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1 px-4">
          {currentUser.stories.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index === currentStoryIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}