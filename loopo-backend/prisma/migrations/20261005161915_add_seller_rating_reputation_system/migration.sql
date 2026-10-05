-- CreateEnum
CREATE TYPE "RatingEligibilityStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "ReportTargetType" ADD VALUE 'REVIEW';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "eligibilityId" UUID;

-- CreateTable
CREATE TABLE "rating_eligibilities" (
    "id" UUID NOT NULL,
    "buyerId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "status" "RatingEligibilityStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_eligibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_tags" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_photos" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_responses" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "review_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReviewToReviewTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ReviewToReviewTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "rating_eligibilities_orderId_key" ON "rating_eligibilities"("orderId");

-- CreateIndex
CREATE INDEX "rating_eligibilities_buyerId_status_idx" ON "rating_eligibilities"("buyerId", "status");

-- CreateIndex
CREATE INDEX "rating_eligibilities_sellerId_idx" ON "rating_eligibilities"("sellerId");

-- CreateIndex
CREATE INDEX "rating_eligibilities_status_expiresAt_idx" ON "rating_eligibilities"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "rating_eligibilities_buyerId_sellerId_productId_key" ON "rating_eligibilities"("buyerId", "sellerId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "review_tags_slug_key" ON "review_tags"("slug");

-- CreateIndex
CREATE INDEX "review_photos_reviewId_idx" ON "review_photos"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "review_responses_reviewId_key" ON "review_responses"("reviewId");

-- CreateIndex
CREATE INDEX "_ReviewToReviewTag_B_index" ON "_ReviewToReviewTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_eligibilityId_key" ON "reviews"("eligibilityId");

-- CreateIndex
CREATE INDEX "reviews_isVisible_deletedAt_idx" ON "reviews"("isVisible", "deletedAt");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_eligibilityId_fkey" FOREIGN KEY ("eligibilityId") REFERENCES "rating_eligibilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_eligibilities" ADD CONSTRAINT "rating_eligibilities_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_eligibilities" ADD CONSTRAINT "rating_eligibilities_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_eligibilities" ADD CONSTRAINT "rating_eligibilities_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_eligibilities" ADD CONSTRAINT "rating_eligibilities_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_photos" ADD CONSTRAINT "review_photos_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewToReviewTag" ADD CONSTRAINT "_ReviewToReviewTag_A_fkey" FOREIGN KEY ("A") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewToReviewTag" ADD CONSTRAINT "_ReviewToReviewTag_B_fkey" FOREIGN KEY ("B") REFERENCES "review_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

