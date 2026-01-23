"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import InfiniteScroll from "react-infinite-scroll-component"
import PostCard from "./PostCard"
import CreatePost from "./CreatePost"
import StoriesSection from "./StoriesSection"
import RealtimeFeed from "./RealtimeFeed"

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

export default function Feed() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`)
      const data = await response.json()

      if (append) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }

      setHasMore(data.posts.length === 10)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching posts:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1, false)
  }, [])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, true)
  }

  const handlePostCreated = () => {
    fetchPosts(1, false)
    setPage(1)
  }

  const handlePostsUpdate = (updatedPosts: Post[]) => {
    setPosts(updatedPosts)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">Baseball Social</h1>
          <div className="flex items-center space-x-4">
            <Link href="/notifications" className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
            <Link href={`/profile/${session?.user?.username}`}>
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.username || "Profile"}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {session?.user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <StoriesSection />

      {/* Create Post - Hidden on mobile, shown in create page */}
      <div className="hidden md:block">
        <CreatePost onPostCreated={handlePostCreated} />
      </div>

      {/* Real-time updates */}
      <RealtimeFeed posts={posts} onPostsUpdate={handlePostsUpdate} />

      {/* Posts Feed */}
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="text-center py-4 text-gray-500 text-sm">Loading more posts...</div>}
        endMessage={
          <div className="text-center py-4 text-gray-500 text-sm">
            No more posts to load
          </div>
        }
      >
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}