-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('KAKAO', 'NAVER', 'GOOGLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" "SocialProvider",
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_providerId_key" ON "User"("provider", "providerId");

