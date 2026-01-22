"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    fetchExploreData()
  }, [activeTab])

  const fetchExploreData = async () => {
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
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <Sparkles className="w-8 h-8 mr-2 text-primary-600" />
          Explore
        </h1>
        <p className="text-gray-600 mb-6">Discover content tailored to your interests</p>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "recommended"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Recommended
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "trending"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Trending
          </button>
          <button
            onClick={() => setActiveTab("suggested")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "suggested"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Suggested Users
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <>
          {activeTab === "trending" && (
            <div className="space-y-8">
              {/* Trending Hashtags */}
              {trendingHashtags.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Hash className="w-5 h-5 mr-2" />
                    Trending Hashtags
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {trendingHashtags.map(({ tag, count }) => (
                      <Link
                        key={tag}
                        href={`/hashtag/${tag}`}
                        className="flex items-center space-x-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <span className="font-semibold">#{tag}</span>
                        <span className="text-sm text-gray-600">({count} posts)</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Posts */}
              <div>
                <h2 className="text-xl font-bold mb-4">Trending Posts</h2>
                {trendingPosts.length === 0 ? (
                  <div className="card text-center text-gray-500 py-12">
                    No trending posts at the moment
                  </div>
                ) : (
                  <div className="space-y-6">
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
              <h2 className="text-xl font-bold mb-4">Users You Might Like</h2>
              {suggestedUsers.length === 0 ? (
                <div className="card text-center text-gray-500 py-12">
                  No suggested users at the moment
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestedUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="card flex items-center space-x-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
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
                          <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-xl font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{user.name || user.username}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        {user.bio && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</p>
                        )}
                        {user.favoriteTeam && (
                          <span className="inline-block mt-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                            ⚾ {user.favoriteTeam}
                          </span>
                        )}
                        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                          <span>{user._count.posts} posts</span>
                          <span>{user._count.followers} followers</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "recommended" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
              {posts.length === 0 ? (
                <div className="card text-center text-gray-500 py-12">
                  No recommended posts yet. Follow more users or update your profile preferences!
                </div>
              ) : (
                <div className="space-y-6">
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