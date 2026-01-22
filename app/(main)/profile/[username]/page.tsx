"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import PostCard from "@/components/PostCard"
import { UserPlus, UserMinus, MapPin, Calendar, Edit } from "lucide-react"
import Link from "next/link"

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

export default function ProfilePage() {
  const { username } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchPosts()
  }, [username])

  const fetchUser = async () => {
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
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/users/${username}/posts`)
      const data = await response.json()
      setPosts(data.posts)
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">User not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.username}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-3xl font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
                <p className="text-gray-500">@{user.username}</p>
              </div>
              {user.isOwnProfile ? (
                <Link
                  href={`/profile/${username}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Profile</span>
                </Link>
              ) : (
                session && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      following
                        ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {following ? (
                      <>
                        <UserMinus className="w-5 h-5" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )
              )}
            </div>

            {user.bio && <p className="text-gray-700 mb-3">{user.bio}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {(user.favoriteTeam || user.favoritePlayer) && (
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {user.favoriteTeam && (
                  <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                    ⚾ Team: {user.favoriteTeam}
                  </div>
                )}
                {user.favoritePlayer && (
                  <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                    👤 Player: {user.favoritePlayer}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-6">
              <div>
                <span className="font-semibold">{user._count.posts}</span>
                <span className="text-gray-600 ml-1">Posts</span>
              </div>
              <div>
                <span className="font-semibold">{user._count.followers}</span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-semibold">{user._count.following}</span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold">Posts</h2>
        {posts.length === 0 ? (
          <div className="card text-center text-gray-500 py-12">
            No posts yet. {user.isOwnProfile ? "Create your first post!" : "This user hasn't posted anything yet."}
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}