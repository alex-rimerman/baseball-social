"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Send, Image as ImageIcon, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  content: string
  imageUrl: string | null
  senderId: string
  receiverId: string
  read: boolean
  createdAt: string
  sender: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
  receiver: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
}

interface Conversation {
  user: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
  lastMessage: Message
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchConversations()
    }
  }, [session])

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId)
      const interval = setInterval(() => fetchMessages(selectedUserId), 2000)
      return () => clearInterval(interval)
    }
  }, [selectedUserId])

  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Check for userId in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const userIdParam = urlParams.get("userId")
    if (userIdParam) {
      setSelectedUserId(userIdParam)
    }
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSend = async () => {
    if ((!newMessage.trim() && !imageFile) || !selectedUserId || sending) return

    setSending(true)
    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUserId,
          content: newMessage.trim() || "",
          imageUrl,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        setImageFile(null)
        setImagePreview(null)
        fetchMessages(selectedUserId)
        fetchConversations()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const selectedConversation = conversations.find(
    (c) => c.user.id === selectedUserId
  )

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20">
        <div className="text-center py-12 text-gray-500">Please sign in</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-white pb-20 flex">
      {/* Conversations list */}
      <div className={`${selectedUserId ? "hidden md:block" : "block"} w-full md:w-1/3 border-r border-gray-200`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-sm">
              No messages yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.user.id}
                onClick={() => setSelectedUserId(conversation.user.id)}
                className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 border-b border-gray-100 ${
                  selectedUserId === conversation.user.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  {conversation.user.image ? (
                    <Image
                      src={conversation.user.image}
                      alt={conversation.user.username}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {conversation.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {conversation.user.name || conversation.user.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.lastMessage.content}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {conversation.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages view */}
      {selectedUserId ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedUserId(null)}
              className="md:hidden p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {selectedConversation?.user.image ? (
                <Image
                  src={selectedConversation.user.image}
                  alt={selectedConversation.user.username}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedConversation?.user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {selectedConversation?.user.name || selectedConversation?.user.username}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isSender = message.senderId === session.user?.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isSender ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    } rounded-lg p-3`}
                  >
                    {message.imageUrl && (
                      <Image
                        src={message.imageUrl}
                        alt="Message"
                        width={300}
                        height={300}
                        className="rounded-lg mb-2"
                        unoptimized
                      />
                    )}
                    {message.content && <p className="text-sm">{message.content}</p>}
                    <p className={`text-xs mt-1 ${isSender ? "text-blue-100" : "text-gray-500"}`}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            {imagePreview && (
              <div className="relative mb-2">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-lg"
                  unoptimized
                />
                <button
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer p-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                />
                <ImageIcon className="w-5 h-5 text-gray-600" />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={sending || (!newMessage.trim() && !imageFile)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
          Select a conversation to start messaging
        </div>
      )}
    </div>
  )
}