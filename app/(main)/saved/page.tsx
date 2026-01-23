"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import PostCard from "@/components/PostCard"
import InfiniteScroll from "react-infinite-scroll-component"

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
  isSaved?: boolean
  _count: {
    likes: number
    comments: number
  }
  createdAt: string
}

export default function SavedPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchSavedPosts()
    }
  }, [session])

  const fetchSavedPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`/api/posts/saved?page=${pageNum}&limit=10`)
      const data = await response.json()

      if (append) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }

      setHasMore(data.posts.length === 10)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching saved posts:", error)
      setLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchSavedPosts(nextPage, true)
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center text-gray-500 py-12 text-sm">Please sign in to view saved posts</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-8 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-sm">Saved</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-sm mb-2">No saved posts yet</p>
          <p className="text-xs text-gray-400">Save posts to easily find them later!</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<div className="text-center py-4 text-gray-500 text-sm">Loading more posts...</div>}
          endMessage={
            <div className="text-center py-4 text-gray-500 text-sm">
              No more saved posts
            </div>
          }
        >
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}