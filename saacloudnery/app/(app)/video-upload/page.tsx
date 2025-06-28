"use client"
import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

function VideoUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const router = useRouter()

    const MAX_FILE_SIZE = 70 * 1024 * 1024 // 70MB

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            alert("Please select a file")
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert(`File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`)
            return;
        }

        setIsUploading(true)
        setUploadProgress(0)

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("originalSize", file.size.toString());

        console.log("🚀 Starting upload...", {
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
            title,
            description
        });

        try {
            const response = await axios.post("/api/video-upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000, // 5 minutes timeout
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                        console.log(`Upload progress: ${progress}%`);
                    }
                }
            });
            
            console.log("✅ Upload successful:", response.data);
            
            // Check for successful response
            if (response.status === 200 && response.data) {
                alert("🎉 Video uploaded successfully!");
                
                // Reset form
                setFile(null);
                setTitle("");
                setDescription("");
                setUploadProgress(0);
                
                // Navigate to home
                router.push("/");
            } else {
                throw new Error("Unexpected response format");
            }
            
        } catch (error) {
            console.log("❌ Upload failed:", error);
            
            let errorMessage = "Upload failed: ";
            
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    errorMessage += "Request timeout. Please try with a smaller file.";
                } else if (error.response) {
                    // Server responded with error status
                    const serverError = error.response.data?.error || error.response.data?.details || 'Server error';
                    errorMessage += `${serverError} (Status: ${error.response.status})`;
                    console.log("Server error details:", error.response.data);
                } else if (error.request) {
                    // Request was made but no response received
                    errorMessage += "No response from server. Check your connection.";
                } else {
                    // Something else happened
                    errorMessage += error.message;
                }
            } else {
                errorMessage += "Unknown error occurred";
            }
            
            alert(errorMessage);
            
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Upload Video</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="label">
                        <span className="label-text font-medium">Title *</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Enter video title"
                        required
                        disabled={isUploading}
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="textarea textarea-bordered w-full h-24"
                        placeholder="Enter video description (optional)"
                        disabled={isUploading}
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text font-medium">Video File *</span>
                        <span className="label-text-alt">Max size: {MAX_FILE_SIZE / 1024 / 1024}MB</span>
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="file-input file-input-bordered w-full"
                        required
                        disabled={isUploading}
                    />
                    {file && (
                        <div className="mt-2 p-3 bg-base-200 rounded-lg">
                            <p className="text-sm">
                                <strong>Selected:</strong> {file.name}
                            </p>
                            <p className="text-sm">
                                <strong>Size:</strong> {formatFileSize(file.size)}
                            </p>
                            {file.size > MAX_FILE_SIZE && (
                                <p className="text-sm text-error mt-1">
                                    ⚠️ File size exceeds maximum limit
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {isUploading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <progress 
                            className="progress progress-primary w-full" 
                            value={uploadProgress} 
                            max="100"
                        ></progress>
                    </div>
                )}

                <button
                    type="submit"
                    className={`btn w-full ${isUploading ? 'btn-disabled' : 'btn-primary'}`}
                    disabled={isUploading || (file && file.size > MAX_FILE_SIZE)}
                >
                    {isUploading 
                        ? `Uploading... ${uploadProgress}%` 
                        : "Upload Video"
                    }
                </button>
            </form>

            {/* Upload Tips */}
            <div className="mt-8 p-4 bg-base-200 rounded-lg">
                <h3 className="font-medium mb-2">Upload Tips:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Supported formats: MP4, AVI, MOV, WMV, etc.</li>
                    <li>Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB</li>
                    <li>Larger files may take longer to upload</li>
                    <li>Don't close the browser during upload</li>
                </ul>
            </div>
        </div>
    );
}

export default VideoUpload