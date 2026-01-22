"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditProfilePage() {
  const { username } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    favoriteTeam: "",
    favoritePlayer: "",
    location: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${username}`)
      const data = await response.json()
      setFormData({
        name: data.name || "",
        bio: data.bio || "",
        favoriteTeam: data.favoriteTeam || "",
        favoritePlayer: data.favoritePlayer || "",
        location: data.location || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    if (session?.user?.username !== username) {
      router.push(`/profile/${username}`)
      return
    }
    fetchProfile()
  }, [username, session, router, fetchProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/users/${username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to update profile")
        return
      }

      router.push(`/profile/${username}`)
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
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
        <Link
          href={`/profile/${username}`}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to profile</span>
        </Link>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="input-field resize-none"
            placeholder="Tell us about yourself..."
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.bio.length}/160 characters
          </p>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
            placeholder="City, State"
          />
        </div>

        <div>
          <label htmlFor="favoriteTeam" className="block text-sm font-medium text-gray-700 mb-1">
            Favorite Team ⚾
          </label>
          <input
            id="favoriteTeam"
            name="favoriteTeam"
            type="text"
            value={formData.favoriteTeam}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., New York Yankees"
          />
        </div>

        <div>
          <label htmlFor="favoritePlayer" className="block text-sm font-medium text-gray-700 mb-1">
            Favorite Player 👤
          </label>
          <input
            id="favoritePlayer"
            name="favoritePlayer"
            type="text"
            value={formData.favoritePlayer}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Aaron Judge"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
          <Link
            href={`/profile/${username}`}
            className="btn-secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}