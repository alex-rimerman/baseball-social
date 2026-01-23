"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { UserPlus, UserMinus, MoreHorizontal, Grid3x3 } from "lucide-react"

interface User {
  id: string
  username: string
  name: string | null
  image: string | null
  bio: string | null
  favoriteTeam: string | null
  favoritePlayer: string | null
  location: string | null
  createdAt: string
  isFollowing: boolean
  isOwnProfile: boolean
  _count: {
    posts: number
    followers: number
    following: number
  }
}

interface Post {
  id: string
  imageUrl: string | null
  videoUrl: string | null
}

export default function ProfilePage() {
  const { username } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${username}`)
      const data = await response.json()
      setUser(data)
      setFollowing(data.isFollowing || false)
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }, [username])

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${username}/posts`)
      const data = await response.json()
      setPosts(data.posts)
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }, [username])

  useEffect(() => {
    fetchUser()
    fetchPosts()
  }, [fetchUser, fetchPosts])

  const handleFollow = async () => {
    if (!session || !user || user.isOwnProfile) return

    setFollowLoading(true)
    const previousFollowing = following

    setFollowing(!following)
    if (following) {
      setUser((prev) =>
        prev ? { ...prev, _count: { ...prev._count, followers: prev._count.followers - 1 } } : null
      )
    } else {
      setUser((prev) =>
        prev ? { ...prev, _count: { ...prev._count, followers: prev._count.followers + 1 } } : null
      )
    }

    try {
      const response = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.following !== !previousFollowing) {
        setFollowing(previousFollowing)
        setUser((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  followers: previousFollowing
                    ? prev._count.followers + 1
                    : prev._count.followers - 1,
                },
              }
            : null
        )
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
      setFollowing(previousFollowing)
      setUser((prev) =>
        prev
          ? {
              ...prev,
              _count: {
                ...prev._count,
                followers: previousFollowing
                  ? prev._count.followers + 1
                  : prev._count.followers - 1,
              },
            }
          : null
      )
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-8">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-8">User not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
        <button onClick={() => router.back()} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-sm">{user.username}</h1>
        <button className="p-2">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-6">
        <div className="flex items-start space-x-6 mb-6">
          {/* Profile Picture */}
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.username}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Stats and Actions */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-center">
                <div className="font-semibold">{user._count.posts}</div>
                <div className="text-xs text-gray-600">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{user._count.followers.toLocaleString()}</div>
                <div className="text-xs text-gray-600">followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{user._count.following}</div>
                <div className="text-xs text-gray-600">following</div>
              </div>
            </div>

            {/* Action Button */}
            {user.isOwnProfile ? (
              <Link
                href={`/profile/${username}/edit`}
                className="block w-full text-center py-1.5 px-4 border border-gray-300 rounded-md text-sm font-semibold"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`w-full py-1.5 px-4 rounded-md text-sm font-semibold ${
                  following
                    ? "bg-gray-200 text-gray-900"
                    : "bg-blue-500 text-white"
                } disabled:opacity-50`}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <h2 className="font-semibold text-sm mb-1">{user.name || user.username}</h2>
          {user.bio && <p className="text-sm mb-1">{user.bio}</p>}
          {user.location && (
            <p className="text-sm text-gray-600 mb-1">{user.location}</p>
          )}
          {(user.favoriteTeam || user.favoritePlayer) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {user.favoriteTeam && (
                <span className="text-sm text-blue-600">⚾ {user.favoriteTeam}</span>
              )}
              {user.favoritePlayer && (
                <span className="text-sm text-blue-600">👤 {user.favoritePlayer}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="border-t border-gray-300">
        <div className="flex items-center justify-center py-3 border-b border-gray-300">
          <Grid3x3 className="w-5 h-5 mr-2" />
          <span className="text-xs font-semibold uppercase tracking-wide">Posts</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Grid3x3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="aspect-square bg-gray-100 relative group"
              >
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt="Post"
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    unoptimized
                  />
                ) : post.videoUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}