"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Bell, Heart, MessageCircle, UserPlus, AtSign } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  read: boolean
  createdAt: string
  sender: {
    id: string
    username: string
    name: string | null
    image: string | null
  } | null
  postId: string | null
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, read: true }),
      })

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-current" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500 fill-current" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500 fill-current" />
      case "mention":
        return <AtSign className="w-5 h-5 text-purple-500 fill-current" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getNotificationText = (notification: Notification) => {
    const senderName = notification.sender?.name || notification.sender?.username || "Someone"
    
    switch (notification.type) {
      case "like":
        return `${senderName} liked your post`
      case "comment":
        return `${senderName} commented on your post`
      case "follow":
        return `${senderName} started following you`
      case "mention":
        return `${senderName} mentioned you in a post`
      default:
        return "New notification"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-8 text-sm">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-300 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-500 font-semibold"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-4 px-4 py-3 border-b border-gray-200 ${
                !notification.read ? "bg-blue-50" : ""
              }`}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id)
                }
                if (notification.postId) {
                  router.push(`/posts/${notification.postId}`)
                } else if (notification.type === "follow" && notification.sender) {
                  router.push(`/profile/${notification.sender.username}`)
                }
              }}
            >
              <div className="flex-shrink-0">
                {notification.sender?.image ? (
                  <Image
                    src={notification.sender.image}
                    alt={notification.sender.username}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {notification.sender?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {getNotificationIcon(notification.type)}
                  <p className="text-sm">{getNotificationText(notification)}</p>
                </div>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>

              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}