"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Bookmark, BookmarkCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import ReactPlayer from "react-player"
import CommentSection from "@/components/CommentSection"

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

export default function PostDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError("Post not found")
        } else {
          setError("Failed to load post")
        }
        return
      }
      const data = await response.json()
      setPost(data.post)
      setIsLiked(data.post.isLiked)
      setLikesCount(data.post._count.likes)
      setIsSaved(data.post.isSaved || false)
    } catch (error) {
      console.error("Error fetching post:", error)
      setError("Failed to load post")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  const handleLike = async () => {
    if (isLiking || !post) return
    
    setIsLiking(true)
    const previousLiked = isLiked
    const previousCount = likesCount

    setIsLiked(!isLiked)
    setLikesCount(previousLiked ? likesCount - 1 : likesCount + 1)

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      })
      const data = await response.json()

      if (!data.liked !== previousLiked) {
        setIsLiked(previousLiked)
        setLikesCount(previousCount)
      }
    } catch (error) {
      console.error("Error liking post:", error)
      setIsLiked(previousLiked)
      setLikesCount(previousCount)
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (isSaving || !post) return
    
    setIsSaving(true)
    const previousSaved = isSaved

    setIsSaved(!isSaved)

    try {
      const response = await fetch(`/api/posts/${post.id}/save`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.saved !== !previousSaved) {
        setIsSaved(previousSaved)
      }
    } catch (error) {
      console.error("Error saving post:", error)
      setIsSaved(previousSaved)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-8">Loading post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="px-4 py-3 border-b border-gray-300">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-semibold mb-2">{error || "Post not found"}</p>
          <p className="text-sm">This post may have been deleted or doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-sm">Post</h1>
        <button className="p-2">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Post Content */}
      <div className="bg-white">
        {/* Author Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <Link
            href={`/profile/${post.author.username}`}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.username}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {post.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="font-semibold text-sm">{post.author.username}</span>
          </Link>
        </div>

        {/* Media */}
        <div className="w-full aspect-square bg-black">
          {post.videoUrl ? (
            <ReactPlayer
              url={post.videoUrl}
              width="100%"
              height="100%"
              controls
              playing={false}
            />
          ) : post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.content || "Post image"}
              fill
              className="object-contain"
              unoptimized
            />
          ) : null}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <button onClick={handleLike} className="p-0">
                {isLiked ? (
                  <Heart className="w-6 h-6 text-red-500 fill-current" />
                ) : (
                  <Heart className="w-6 h-6 text-gray-900" />
                )}
              </button>
              <button className="p-0">
                <MessageCircle className="w-6 h-6 text-gray-900" />
              </button>
              <button className="p-0">
                <Share2 className="w-6 h-6 text-gray-900" />
              </button>
            </div>
            <button onClick={handleSave} className="p-0">
              {isSaved ? (
                <BookmarkCheck className="w-6 h-6 text-gray-900 fill-current" />
              ) : (
                <Bookmark className="w-6 h-6 text-gray-900" />
              )}
            </button>
          </div>

          {/* Likes count */}
          {likesCount > 0 && (
            <div className="mb-2">
              <span className="font-semibold text-sm">{likesCount} likes</span>
            </div>
          )}

          {/* Caption */}
          {post.content && (
            <div className="mb-2">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-sm mr-2"
              >
                {post.author.username}
              </Link>
              <span className="text-sm">{post.content}</span>
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {post.hashtags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/hashtag/${tag}`}
                      className="text-sm text-blue-600"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Time */}
          <div className="text-gray-400 text-xs uppercase mt-2">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-4 pb-3">
          <CommentSection
            postId={post.id}
            onCommentAdded={() => {
              fetchPost()
            }}
          />
        </div>
      </div>
    </div>
  )
}