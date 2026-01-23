import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and videos are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 100MB." },
        { status: 400 }
      )
    }

    const url = await uploadToCloudinary(file)
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading file:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}