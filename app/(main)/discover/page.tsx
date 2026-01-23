"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, User, Hash, Filter, X } from "lucide-react"
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
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({})
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState<"all" | "users" | "posts">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    sortBy: "recent",
    minLikes: "",
    hashtag: "",
    location: "",
    favoriteTeam: "",
  })

  const performSearch = useCallback(async () => {
    if (!query.trim() && searchType !== "posts") {
      setResults({})
      return
    }

    setLoading(true)
    try {
      let url = `/api/search?q=${encodeURIComponent(query)}&type=${searchType}`
      if (searchType === "posts" && (filters.sortBy !== "recent" || filters.minLikes || filters.hashtag)) {
        url = `/api/search/advanced?type=posts`
        if (query) url += `&q=${encodeURIComponent(query)}`
        if (filters.sortBy) url += `&sortBy=${filters.sortBy}`
        if (filters.minLikes) url += `&minLikes=${filters.minLikes}`
        if (filters.hashtag) url += `&hashtag=${encodeURIComponent(filters.hashtag)}`
        if (filters.location) url += `&location=${encodeURIComponent(filters.location)}`
        if (filters.favoriteTeam) url += `&favoriteTeam=${encodeURIComponent(filters.favoriteTeam)}`
      } else if (searchType === "users" && (filters.location || filters.favoriteTeam)) {
        url = `/api/search/advanced?type=users`
        if (query) url += `&q=${encodeURIComponent(query)}`
        if (filters.location) url += `&location=${encodeURIComponent(filters.location)}`
        if (filters.favoriteTeam) url += `&favoriteTeam=${encodeURIComponent(filters.favoriteTeam)}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }, [query, searchType, filters])

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
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-0 text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => setSearchType("all")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              searchType === "all"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSearchType("users")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              searchType === "users"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setSearchType("posts")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              searchType === "posts"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400"
            }`}
          >
            Posts
          </button>
          {(searchType === "posts" || searchType === "users") && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 text-sm font-semibold border-b-2 border-transparent"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (searchType === "posts" || searchType === "users") && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {searchType === "posts" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Minimum Likes</label>
                  <input
                    type="number"
                    value={filters.minLikes}
                    onChange={(e) => setFilters({ ...filters, minLikes: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Hashtag</label>
                  <input
                    type="text"
                    value={filters.hashtag}
                    onChange={(e) => setFilters({ ...filters, hashtag: e.target.value })}
                    placeholder="#hashtag"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
            {searchType === "users" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="City, State"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Favorite Team</label>
                  <input
                    type="text"
                    value={filters.favoriteTeam}
                    onChange={(e) => setFilters({ ...filters, favoriteTeam: e.target.value })}
                    placeholder="Team name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setFilters({
                  sortBy: "recent",
                  minLikes: "",
                  hashtag: "",
                  location: "",
                  favoriteTeam: "",
                })
                setShowFilters(false)
              }}
              className="mt-3 text-sm text-blue-600"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500 text-sm">Searching...</div>
      )}

      {!loading && query.trim().length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">Start searching to find users, posts, and hashtags</p>
        </div>
      )}

      {!loading && query.trim().length > 0 && (
        <>
          {(searchType === "all" || searchType === "users") && results.users && (
            <div className="mb-4">
              {results.users.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No users found
                </div>
              ) : (
                <div>
                  {results.users.map((user) => (
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
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {(searchType === "all" || searchType === "posts") && results.posts && (
            <div>
              {results.posts.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No posts found
                </div>
              ) : (
                <div>
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
              <div className="text-center text-gray-500 py-12 text-sm">
                No results found for &quot;{query}&quot;
              </div>
            )}
        </>
      )}
    </div>
  )
}