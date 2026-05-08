-- CreateTable
CREATE TABLE "TransformationHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "transformedUrl" TEXT NOT NULL,
    "effects" TEXT[],
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransformationHistory_pkey" PRIMARY KEY ("id")
);
