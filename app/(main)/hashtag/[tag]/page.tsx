"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Hash } from "lucide-react"
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="card mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Hash className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold">#{hashtag}</h1>
            <p className="text-gray-600 mt-1">{totalPosts} posts</p>
          </div>
        </div>
      </div>

      <InfiniteScroll
        dataLength={posts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="text-center py-4">Loading more posts...</div>}
        endMessage={
          <div className="text-center py-4 text-gray-500">
            No more posts for #{hashtag}
          </div>
        }
      >
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </InfiniteScroll>

      {posts.length === 0 && (
        <div className="card text-center text-gray-500 py-12">
          No posts found for #{hashtag}
        </div>
      )}
    </div>
  )
}