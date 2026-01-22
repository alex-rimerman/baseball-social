"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Search, User, Hash } from "lucide-react"
import PostCard from "@/components/PostCard"

interface SearchResult {
  users?: Array<{
    id: string
    username: string
    name: string | null
    image: string | null
    bio: string | null
    _count: {
      followers: number
      following: number
      posts: number
    }
  }>
  posts?: Array<{
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
  }>
}

export default function DiscoverPage() {
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({})
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState<"all" | "users" | "posts">("all")

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }, [query, searchType])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch()
      } else {
        setResults({})
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchType, performSearch])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Discover</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, posts, or hashtags..."
            className="w-full pl-10 pr-4 py-3 input-field"
          />
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setSearchType("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              searchType === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSearchType("users")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              searchType === "users"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setSearchType("posts")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              searchType === "posts"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Posts
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">Searching...</div>
      )}

      {!loading && query.trim().length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Start searching to find users, posts, and hashtags</p>
        </div>
      )}

      {!loading && query.trim().length > 0 && (
        <>
          {(searchType === "all" || searchType === "users") && results.users && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Users
              </h2>
              {results.users.length === 0 ? (
                <div className="card text-center text-gray-500 py-8">
                  No users found
                </div>
              ) : (
                <div className="space-y-4">
                  {results.users.map((user) => (
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

          {(searchType === "all" || searchType === "posts") && results.posts && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Posts
              </h2>
              {results.posts.length === 0 ? (
                <div className="card text-center text-gray-500 py-8">
                  No posts found
                </div>
              ) : (
                <div className="space-y-6">
                  {results.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading &&
            query.trim().length > 0 &&
            (!results.users || results.users.length === 0) &&
            (!results.posts || results.posts.length === 0) && (
              <div className="card text-center text-gray-500 py-12">
                No results found for &quot;{query}&quot;
              </div>
            )}
        </>
      )}
    </div>
  )
}