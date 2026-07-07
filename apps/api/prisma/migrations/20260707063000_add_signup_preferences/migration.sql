-- CreateEnum
CREATE TYPE "GenreTag" AS ENUM ('EMOTIONAL', 'HORROR', 'SCIFI', 'IMMERSIVE');

-- CreateEnum
CREATE TYPE "PacingPreference" AS ENUM ('STORY', 'SPEED');

-- CreateEnum
CREATE TYPE "RoomTypePreference" AS ENUM ('PUZZLE', 'DEVICE');

-- CreateEnum
CREATE TYPE "HorrorRole" AS ENUM ('SCARED', 'PUSH_THROUGH', 'TANK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "genrePreferences" "GenreTag"[] DEFAULT ARRAY[]::"GenreTag"[],
ADD COLUMN     "horrorRole" "HorrorRole",
ADD COLUMN     "isBeginner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pacingPreference" "PacingPreference",
ADD COLUMN     "roomTypePreference" "RoomTypePreference";

