"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred")
        return
      }

      // Auto sign in after signup
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        router.push("/auth/signin")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Baseball Social
          </h1>
          <p className="text-gray-500 text-sm">Sign up to get started</p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-gray-50"
                placeholder="Full Name"
              />
            </div>

            <div>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-gray-50"
                placeholder="Username"
              />
            </div>

            <div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-gray-50"
                placeholder="Email"
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-gray-50"
                placeholder="Password"
              />
              <p className="text-xs text-gray-500 mt-1.5">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="mt-4 bg-white border border-gray-300 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-900">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-500 font-semibold hover:text-blue-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}