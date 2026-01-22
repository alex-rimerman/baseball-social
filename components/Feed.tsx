"use client"

import { useState, useEffect } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import PostCard from "./PostCard"
import CreatePost from "./CreatePost"

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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Baseball Social</h1>
        <p className="text-gray-600">Welcome to your feed</p>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      <InfiniteScroll
        dataLength={posts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="text-center py-4">Loading more posts...</div>}
        endMessage={
          <div className="text-center py-4 text-gray-500">
            No more posts to load
          </div>
        }
      >
        <div className="space-y-6 mt-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}