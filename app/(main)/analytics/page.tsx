"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { BarChart3, Eye, Heart, MessageCircle, TrendingUp, Users } from "lucide-react"

interface Analytics {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalViews: number
  followers: number
  following: number
  postsThisWeek: number
  likesThisWeek: number
  topPosts: Array<{
    id: string
    content: string | null
    likes: number
    comments: number
  }>
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
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
        <div className="text-center py-12">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Analytics
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Posts</span>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">{analytics?.totalPosts || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Likes</span>
              <Heart className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">{analytics?.totalLikes || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Comments</span>
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">{analytics?.totalComments || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Followers</span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">{analytics?.followers || 0}</p>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            This Week
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">New Posts</p>
              <p className="text-2xl font-bold">{analytics?.postsThisWeek || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">New Likes</p>
              <p className="text-2xl font-bold">{analytics?.likesThisWeek || 0}</p>
            </div>
          </div>
        </div>

        {/* Top Posts */}
        {analytics?.topPosts && analytics.topPosts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold mb-4">Top Performing Posts</h2>
            <div className="space-y-3">
              {analytics.topPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-100 pb-3 last:border-0">
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}