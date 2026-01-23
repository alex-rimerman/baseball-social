"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Lock, Shield, User, Trash2, LogOut } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [privateAccount, setPrivateAccount] = useState(false)

  useEffect(() => {
    if (session) {
      fetchSettings()
    }
  }, [session])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.username}`)
      if (response.ok) {
        const data = await response.json()
        setPrivateAccount(data.isPrivate || false)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const handlePrivateToggle = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: !privateAccount }),
      })
      if (response.ok) {
        setPrivateAccount(!privateAccount)
      }
    } catch (error) {
      console.error("Error updating privacy:", error)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    if (!confirm("This will permanently delete all your posts, comments, and data. Type DELETE to confirm.")) {
      return
    }

    try {
      const response = await fetch(`/api/users/${session?.user?.username}`, {
        method: "DELETE",
      })
      if (response.ok) {
        router.push("/auth/signin")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-12 text-gray-500">Please sign in</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold text-sm">Settings</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Privacy Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2" />
            Privacy
          </h2>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-sm">Private Account</p>
              <p className="text-xs text-gray-500">Only approved followers can see your posts</p>
            </div>
            <button
              onClick={handlePrivateToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privateAccount ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privateAccount ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Push Notifications</span>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Account
          </h2>
          <div className="space-y-3">
            <Link
              href={`/profile/${session.user?.username}/edit`}
              className="block py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-2 -mx-2"
            >
              <span className="text-sm">Edit Profile</span>
            </Link>
            <Link
              href="/analytics"
              className="block py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-2 -mx-2"
            >
              <span className="text-sm">View Analytics</span>
            </Link>
            <Link
              href="/schedule"
              className="block py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-2 -mx-2"
            >
              <span className="text-sm">Scheduled Posts</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left py-3 border-b border-gray-100 hover:bg-gray-50 rounded-lg px-2 -mx-2 flex items-center text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center text-red-600">
            <Shield className="w-5 h-5 mr-2" />
            Danger Zone
          </h2>
          <button
            onClick={handleDeleteAccount}
            className="w-full text-left py-3 text-red-600 hover:bg-red-50 rounded-lg px-2 -mx-2 flex items-center"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            <span className="text-sm font-semibold">Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  )
}