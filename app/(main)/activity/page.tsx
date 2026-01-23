"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Activity, TrendingUp, Users, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ActivityData {
  recentLikes: number
  recentComments: number
  newFollowers: number
  postsEngagement: number
  topEngagedPosts: Array<{
    id: string
    content: string | null
    likes: number
    comments: number
    imageUrl: string | null
  }>
}

export default function ActivityPage() {
  const { data: session } = useSession()
  const [activity, setActivity] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchActivity()
      const interval = setInterval(fetchActivity, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchActivity = async () => {
    try {
      const response = await fetch("/api/activity")
      if (response.ok) {
        const data = await response.json()
        setActivity(data)
      }
    } catch (error) {
      console.error("Error fetching activity:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-12 text-gray-500">Please sign in</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-12">Loading activity...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold flex items-center">
            <Activity className="w-6 h-6 mr-2" />
            Activity Feed
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Recent Likes</span>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold">{activity?.recentLikes || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Recent Comments</span>
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{activity?.recentComments || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">New Followers</span>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{activity?.newFollowers || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Engagement</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{activity?.postsEngagement || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total interactions</p>
          </div>
        </div>

        {/* Top Engaged Posts */}
        {activity?.topEngagedPosts && activity.topEngagedPosts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold mb-4">Most Engaged Posts</h2>
            <div className="space-y-3">
              {activity.topEngagedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block border-b border-gray-100 pb-3 last:border-0 hover:bg-gray-50 rounded-lg p-2 -m-2"
                >
                  <div className="flex items-start space-x-3">
                    {post.imageUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={post.imageUrl}
                          alt="Post"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm mb-2 line-clamp-2">{post.content || "Post"}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}