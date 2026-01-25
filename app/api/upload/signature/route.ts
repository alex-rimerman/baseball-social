import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary configuration missing")
      return NextResponse.json(
        { error: "Upload service not configured. Please check server configuration." },
        { status: 500 }
      )
    }

    const { fileType, fileName } = await request.json()
    
    if (!fileType) {
      return NextResponse.json(
        { error: "File type is required" },
        { status: 400 }
      )
    }

    const isVideo = fileType.startsWith('video/')
    const resourceType = isVideo ? 'video' : 'image'
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Generate signature for unsigned upload
    const params: Record<string, any> = {
      timestamp,
      folder: 'baseball-social',
      resource_type: resourceType,
    }

    if (isVideo) {
      params.eager = 'mp4'
      params.eager_async = false
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: 'baseball-social',
      resourceType,
    })
  } catch (error) {
    console.error("Error generating upload signature:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Failed to generate upload signature: ${errorMessage}` },
      { status: 500 }
    )
  }
}
