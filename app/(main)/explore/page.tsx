"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { TrendingUp, Users, Sparkles, Hash } from "lucide-react"
import PostCard from "@/components/PostCard"
import Image from "next/image"

interface Post {
  id: string
  content: string | null
  imageUrl: string | null
  videoUrl: string | null
  hashtags: string[]
  mentions: string[]
  author: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
  isLiked: boolean
  _count: {
    likes: number
    comments: number
  }
  createdAt: string
}

interface TrendingHashtag {
  tag: string
  count: number
}

interface SuggestedUser {
  id: string
  username: string
  name: string | null
  image: string | null
  bio: string | null
  favoriteTeam: string | null
  _count: {
    followers: number
    posts: number
  }
}

export default function ExplorePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"recommended" | "trending" | "suggested">("recommended")
  const [posts, setPosts] = useState<Post[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([])
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExploreData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/explore?type=${activeTab}`)
      const data = await response.json()

      if (activeTab === "trending") {
        setTrendingHashtags(data.trendingHashtags || [])
        setTrendingPosts(data.trendingPosts || [])
        setPosts(data.trendingPosts || [])
      } else if (activeTab === "suggested") {
        setSuggestedUsers(data.suggestedUsers || [])
      } else {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Error fetching explore data:", error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchExploreData()
  }, [fetchExploreData])

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold">Explore</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === "recommended"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === "trending"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400"
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab("suggested")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === "suggested"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
      ) : (
        <>
          {activeTab === "trending" && (
            <div>
              {/* Trending Hashtags */}
              {trendingHashtags.length > 0 && (
                <div className="px-4 py-4 border-b border-gray-200">
                  <h2 className="text-sm font-semibold mb-3">Trending Hashtags</h2>
                  <div className="flex flex-wrap gap-2">
                    {trendingHashtags.map(({ tag, count }) => (
                      <Link
                        key={tag}
                        href={`/hashtag/${tag}`}
                        className="text-sm text-blue-600"
                      >
                        #{tag} ({count})
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Posts */}
              <div>
                {trendingPosts.length === 0 ? (
                  <div className="text-center text-gray-500 py-12 text-sm">
                    No trending posts at the moment
                  </div>
                ) : (
                  <div>
                    {trendingPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "suggested" && (
            <div>
              {suggestedUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-12 text-sm">
                  No suggested users at the moment
                </div>
              ) : (
                <div>
                  {suggestedUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="flex items-center space-x-4 px-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.username}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{user.name || user.username}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        {user.bio && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{user.bio}</p>
                        )}
                        {user.favoriteTeam && (
                          <span className="inline-block mt-1 text-xs text-blue-600">
                            ⚾ {user.favoriteTeam}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "recommended" && (
            <div>
              {posts.length === 0 ? (
                <div className="text-center text-gray-500 py-12 text-sm">
                  No recommended posts yet. Follow more users or update your profile preferences!
                </div>
              ) : (
                <div>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}