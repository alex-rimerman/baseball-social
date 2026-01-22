"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, BookmarkCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import ReactPlayer from "react-player"
import CommentSection from "./CommentSection"

interface PostCardProps {
  post: {
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
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post._count.likes)
  const [showComments, setShowComments] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post._count.comments)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaved, setIsSaved] = useState((post as any).isSaved || false)
  const [isSaving, setIsSaving] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    
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
    if (isSaving) return
    
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

  const renderContent = () => {
    if (post.videoUrl) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          <ReactPlayer
            url={post.videoUrl}
            width="100%"
            height="100%"
            controls
            playing={false}
          />
        </div>
      )
    }

    if (post.imageUrl) {
      return (
        <div className="w-full relative">
          <Image
            src={post.imageUrl}
            alt={post.content || "Post image"}
            width={800}
            height={800}
            className="w-full h-auto rounded-lg"
            unoptimized
          />
        </div>
      )
    }

    return null
  }

  const renderHashtags = () => {
    if (!post.hashtags || post.hashtags.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {post.hashtags.map((tag, index) => (
          <Link
            key={index}
            href={`/hashtag/${tag}`}
            className="text-primary-600 hover:underline"
          >
            #{tag}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <Link
          href={`/profile/${post.author.username}`}
          className="flex items-center space-x-3"
        >
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.username}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold">{post.author.name || post.author.username}</p>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
          </div>
        </Link>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {post.content && (
        <p 
          className="mb-4 whitespace-pre-wrap cursor-pointer hover:text-primary-600 transition-colors"
          onClick={() => router.push(`/posts/${post.id}`)}
        >
          {post.content}
        </p>
      )}

      <div onClick={() => router.push(`/posts/${post.id}`)} className="cursor-pointer">
        {renderContent()}
      </div>
      {renderHashtags()}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${
            isLiked ? "text-red-600" : "text-gray-600"
          } hover:text-red-600 transition-colors`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/posts/${post.id}`)
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span>{commentsCount}</span>
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center space-x-2 transition-colors ${
            isSaved ? "text-primary-600" : "text-gray-600 hover:text-primary-600"
          }`}
          title={isSaved ? "Unsave post" : "Save post"}
        >
          {isSaved ? (
            <BookmarkCheck className="w-6 h-6 fill-current" />
          ) : (
            <Bookmark className="w-6 h-6" />
          )}
        </button>

        <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
          <Share2 className="w-6 h-6" />
        </button>

        <span 
          className="text-sm text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={() => router.push(`/posts/${post.id}`)}
        >
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentAdded={() => setCommentsCount(commentsCount + 1)}
        />
      )}
    </div>
  )
}