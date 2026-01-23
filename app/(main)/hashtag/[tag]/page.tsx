"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Hash } from "lucide-react"
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
  _count: {
    likes: number
    comments: number
  }
  createdAt: string
}

export default function HashtagPage() {
  const { tag } = useParams()
  const router = useRouter()
  const hashtag = decodeURIComponent(tag as string)
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)

  const fetchPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`/api/hashtag/${encodeURIComponent(hashtag)}?page=${pageNum}&limit=20`)
      const data = await response.json()

      if (append) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
        setTotalPosts(data.totalPosts || 0)
      }

      setHasMore(data.posts.length === 20)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching hashtag posts:", error)
      setLoading(false)
    }
  }, [hashtag])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, true)
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
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5" />
            <h1 className="font-semibold text-sm">{hashtag}</h1>
          </div>
          <div className="w-10"></div>
        </div>
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-600">{totalPosts} posts</p>
        </div>
      </div>

      <InfiniteScroll
        dataLength={posts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="text-center py-4 text-gray-500 text-sm">Loading more posts...</div>}
        endMessage={
          <div className="text-center py-4 text-gray-500 text-sm">
            No more posts for #{hashtag}
          </div>
        }
      >
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </InfiniteScroll>

      {posts.length === 0 && (
        <div className="text-center text-gray-500 py-12 text-sm">
          No posts found for #{hashtag}
        </div>
      )}
    </div>
  )
}