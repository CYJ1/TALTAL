-- CreateEnum
CREATE TYPE "ExperienceTier" AS ENUM ('TIER_10', 'TIER_50', 'TIER_100', 'TIER_100_PLUS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experienceTier" "ExperienceTier";
