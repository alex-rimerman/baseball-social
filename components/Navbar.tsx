"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Home, Search, PlusSquare, Bell, User, LogOut, Sparkles, BookmarkCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:relative md:border-t-0 md:border-b md:sticky md:top-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:justify-around">
          <Link
            href="/"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="hidden md:inline font-medium">Home</span>
          </Link>

          <Link
            href="/discover"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Search className="w-6 h-6" />
            <span className="hidden md:inline font-medium">Discover</span>
          </Link>

          <Link
            href="/explore"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Sparkles className="w-6 h-6" />
            <span className="hidden md:inline font-medium">Explore</span>
          </Link>

          <Link
            href="/create"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <PlusSquare className="w-6 h-6" />
            <span className="hidden md:inline font-medium">Create</span>
          </Link>

          <Link
            href="/saved"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <BookmarkCheck className="w-6 h-6" />
            <span className="hidden md:inline font-medium">Saved</span>
          </Link>

          <Link
            href="/notifications"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            <span className="hidden md:inline font-medium">Notifications</span>
          </Link>

          <Link
            href={`/profile/${session.user?.username}`}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="hidden md:inline font-medium">Profile</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
          >
            <LogOut className="w-6 h-6" />
            <span className="hidden md:inline font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}