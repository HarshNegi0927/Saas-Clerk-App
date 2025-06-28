import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number;
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    try {
        console.log("🚀 Video upload started");
        
        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            console.log("❌ Unauthorized access");
            return NextResponse.json({ 
                error: "Unauthorized", 
                message: "Please log in to upload videos" 
            }, { status: 401 });
        }

        // Check Cloudinary credentials
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
            !process.env.CLOUDINARY_API_KEY || 
            !process.env.CLOUDINARY_API_SECRET) {
            console.log("❌ Missing Cloudinary credentials");
            return NextResponse.json({ 
                error: "Server configuration error", 
                message: "Cloudinary credentials not configured" 
            }, { status: 500 });
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const originalSize = formData.get("originalSize") as string;

        // Validate required fields
        if (!file) {
            return NextResponse.json({ 
                error: "No file provided", 
                message: "Please select a video file to upload" 
            }, { status: 400 });
        }

        if (!title || title.trim().length === 0) {
            return NextResponse.json({ 
                error: "Title required", 
                message: "Please provide a title for your video" 
            }, { status: 400 });
        }

        // Check file size (70MB limit)
        const MAX_SIZE = 70 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ 
                error: "File too large", 
                message: `File size must be less than ${MAX_SIZE / 1024 / 1024}MB` 
            }, { status: 400 });
        }

        console.log("📁 Processing file:", {
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
            type: file.type
        });

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        console.log("☁️ Uploading to Cloudinary...");
        const cloudinaryResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    folder: "video-uploads",
                    transformation: [{ quality: "auto", fetch_format: "mp4" }],
                    timeout: 120000 // 2 minutes timeout
                },
                (error, result) => {
                    if (error) {
                        console.log("❌ Cloudinary upload failed:", error);
                        reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    } else {
                        console.log("✅ Cloudinary upload successful:", result?.public_id);
                        resolve(result as CloudinaryUploadResult);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        // Save to database
        console.log("💾 Saving to database...");
        const video = await prisma.video.create({
            data: {
                title: title.trim(),
                description: description?.trim() || "",
                publicId: cloudinaryResult.public_id,
                originalSize: originalSize,
                compressedSize: String(cloudinaryResult.bytes),
                duration: cloudinaryResult.duration || 0,
            }
        });

        console.log("✅ Video saved successfully:", video.id);

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Video uploaded successfully",
            video: {
                id: video.id,
                title: video.title,
                description: video.description,
                publicId: video.publicId,
                originalSize: video.originalSize,
                compressedSize: video.compressedSize,
                duration: video.duration,
                createdAt: video.createdAt
            }
        }, { status: 200 });

    } catch (error) {
        console.log("❌ Upload failed:", error);
        
        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('Cloudinary')) {
                return NextResponse.json({ 
                    error: "Upload service error", 
                    message: "Failed to upload video. Please try again." 
                }, { status: 500 });
            }
            
            if (error.message.includes('Prisma') || error.message.includes('database')) {
                return NextResponse.json({ 
                    error: "Database error", 
                    message: "Failed to save video information. Please try again." 
                }, { status: 500 });
            }
        }

        return NextResponse.json({ 
            error: "Upload failed", 
            message: "An unexpected error occurred. Please try again." 
        }, { status: 500 });
        
    } finally {
        await prisma.$disconnect();
    }
}