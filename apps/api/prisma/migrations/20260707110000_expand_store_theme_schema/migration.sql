-- Store: region -> district (rename preserves existing NOT NULL data), plus new location fields
ALTER TABLE "Store" RENAME COLUMN "region" TO "district";
ALTER TABLE "Store" ADD COLUMN "neighborhood" TEXT;
ALTER TABLE "Store" ADD COLUMN "address" TEXT;
ALTER TABLE "Store" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Store" ADD COLUMN "longitude" DOUBLE PRECISION;

-- Theme: new fields, added nullable/defaulted first so existing rows don't break the NOT NULL constraint
ALTER TABLE "Theme" ADD COLUMN "generation" "GenerationPreference";
ALTER TABLE "Theme" ADD COLUMN "difficulty" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Theme" ADD COLUMN "pricePerPersonWon" INTEGER;
ALTER TABLE "Theme" ADD COLUMN "recommendedHeadcount" INTEGER;
ALTER TABLE "Theme" ADD COLUMN "recommendedReason" TEXT;
ALTER TABLE "Theme" ADD COLUMN "openedAt" TIMESTAMP(3);

-- Theme.genre: String -> GenreTag enum. Existing rows carry free-text Korean genre names from
-- before the taxonomy rework, so map them to the new 6-category enum instead of a blind cast.
ALTER TABLE "Theme" ADD COLUMN "genre_new" "GenreTag";
UPDATE "Theme" SET "genre_new" = CASE "genre"
  WHEN '감성' THEN 'EMOTIONAL_ROMANCE'
  WHEN '공포' THEN 'HORROR_THRILLER'
  WHEN '미스터리' THEN 'MYSTERY_DETECTIVE'
  WHEN '잠입' THEN 'ACTION_ADVENTURE'
  ELSE 'COMEDY_ETC'
END::"GenreTag";
ALTER TABLE "Theme" DROP COLUMN "genre";
ALTER TABLE "Theme" RENAME COLUMN "genre_new" TO "genre";
ALTER TABLE "Theme" ALTER COLUMN "genre" SET NOT NULL;

-- Backfill the other new NOT NULL columns for existing rows, then enforce NOT NULL
UPDATE "Theme" SET "generation" = 'GEN2' WHERE "generation" IS NULL;
UPDATE "Theme" SET "pricePerPersonWon" = 28000 WHERE "pricePerPersonWon" IS NULL;
ALTER TABLE "Theme" ALTER COLUMN "generation" SET NOT NULL;
ALTER TABLE "Theme" ALTER COLUMN "pricePerPersonWon" SET NOT NULL;
