-- CreateEnum
CREATE TYPE "GenerationPreference" AS ENUM ('GEN1', 'GEN2', 'GEN3');

-- AlterEnum
BEGIN;
CREATE TYPE "GenreTag_new" AS ENUM ('HORROR_THRILLER', 'EMOTIONAL_ROMANCE', 'MYSTERY_DETECTIVE', 'ACTION_ADVENTURE', 'SCIFI_FANTASY', 'COMEDY_ETC');
ALTER TABLE "public"."User" ALTER COLUMN "genrePreferences" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "genrePreferences" TYPE "GenreTag_new"[] USING ("genrePreferences"::text::"GenreTag_new"[]);
ALTER TYPE "GenreTag" RENAME TO "GenreTag_old";
ALTER TYPE "GenreTag_new" RENAME TO "GenreTag";
DROP TYPE "public"."GenreTag_old";
ALTER TABLE "User" ALTER COLUMN "genrePreferences" SET DEFAULT ARRAY[]::"GenreTag"[];
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roomTypePreference",
ADD COLUMN     "generationPreference" "GenerationPreference";

-- DropEnum
DROP TYPE "RoomTypePreference";

