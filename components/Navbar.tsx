"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Home, Search, PlusSquare, Bell, User } from "lucide-react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Show loading state or wait for session
  if (status === "loading") {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-14 max-w-2xl mx-auto">
          <div className="w-12 h-12"></div>
          <div className="w-12 h-12"></div>
          <div className="w-12 h-12"></div>
          <div className="w-12 h-12"></div>
          <div className="w-12 h-12"></div>
        </div>
      </nav>
    )
  }

  if (!session) return null

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive("/") ? "text-gray-900" : "text-gray-600"}`}
        >
          <Home className={`w-6 h-6 ${isActive("/") ? "fill-current" : ""}`} />
          <span className="text-xs mt-1 hidden sm:block">Home</span>
        </Link>

        <Link
          href="/discover"
          className={`flex flex-col items-center justify-center flex-1 py-2 ${isActive("/discover") ? "text-gray-900" : "text-gray-600"}`}
        >
          <Search className={`w-6 h-6 ${isActive("/discover") ? "fill-current" : ""}`} />
          <span className="text-xs mt-1 hidden sm:block">Search</span>
        </Link>

        <Link
          href="/create"
          className="flex flex-col items-center justify-center flex-1 py-2 text-gray-900"
        >
          <div className="w-8 h-8 rounded-lg border-2 border-gray-900 flex items-center justify-center bg-white">
            <PlusSquare className="w-5 h-5" />
          </div>
          <span className="text-xs mt-1 hidden sm:block">Create</span>
        </Link>

        <Link
          href="/notifications"
          className={`flex flex-col items-center justify-center flex-1 py-2 relative ${isActive("/notifications") ? "text-gray-900" : "text-gray-600"}`}
        >
          <Bell className={`w-6 h-6 ${isActive("/notifications") ? "fill-current" : ""}`} />
          <span className="text-xs mt-1 hidden sm:block">Activity</span>
        </Link>

        <Link
          href={`/profile/${session.user?.username}`}
          className={`flex flex-col items-center justify-center flex-1 py-2 ${pathname?.startsWith("/profile") ? "text-gray-900" : "text-gray-600"}`}
        >
          <div className={`w-6 h-6 rounded-full overflow-hidden ${pathname?.startsWith("/profile") ? "ring-2 ring-gray-900" : ""}`}>
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.username || "Profile"}
                width={24}
                height={24}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                {session.user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <span className="text-xs mt-1 hidden sm:block">Profile</span>
        </Link>
      </div>
    </nav>
  )
}