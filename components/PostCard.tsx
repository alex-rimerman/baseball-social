"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, BookmarkCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import ReactPlayer from "react-player"
import CommentSection from "./CommentSection"
import PostMenu from "./PostMenu"

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
  const [showMenu, setShowMenu] = useState(false)

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
        <div className="w-full aspect-square bg-black">
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
        <div className="w-full aspect-square relative bg-gray-100">
          <Image
            src={post.imageUrl}
            alt={post.content || "Post image"}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )
    }

    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 mb-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href={`/profile/${post.author.username}`}
          className="flex items-center space-x-3"
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden ring-2 ring-offset-2 ring-offset-white ring-gray-200">
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
        <button onClick={() => setShowMenu(true)} className="p-1">
          <MoreHorizontal className="w-5 h-5 text-gray-900" />
        </button>
      </div>

      {/* Media */}
      <div onClick={() => router.push(`/posts/${post.id}`)} className="cursor-pointer">
        {renderContent()}
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="p-0"
            >
              {isLiked ? (
                <Heart className="w-6 h-6 text-red-500 fill-current" />
              ) : (
                <Heart className="w-6 h-6 text-gray-900" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/posts/${post.id}`)
              }}
              className="p-0"
            >
              <MessageCircle className="w-6 h-6 text-gray-900" />
            </button>
            <button className="p-0">
              <Share2 className="w-6 h-6 text-gray-900" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className="p-0"
          >
            {isSaved ? (
              <BookmarkCheck className="w-6 h-6 text-gray-900 fill-current" />
            ) : (
              <Bookmark className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <div className="mb-1">
            <span className="font-semibold text-sm">{likesCount} likes</span>
          </div>
        )}

        {/* Caption */}
        {post.content && (
          <div className="mb-1">
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

        {/* View comments */}
        {commentsCount > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-gray-500 text-sm mb-1"
          >
            View all {commentsCount} comments
          </button>
        )}

        {/* Time */}
        <div className="text-gray-400 text-xs uppercase mt-2">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-3 border-t border-gray-100">
          <CommentSection
            postId={post.id}
            onCommentAdded={() => setCommentsCount(commentsCount + 1)}
          />
        </div>
      )}

      {/* Post Menu */}
      {showMenu && (
        <PostMenu
          postId={post.id}
          authorId={post.author.id}
          onClose={() => setShowMenu(false)}
          onDeleted={() => router.refresh()}
        />
      )}
    </div>
  )
}