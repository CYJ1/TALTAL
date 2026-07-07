-- CreateEnum
CREATE TYPE "HistoryStatus" AS ENUM ('PENDING_REVIEW', 'REVIEWED', 'MANUAL_ENTRY');

-- CreateEnum
CREATE TYPE "PartyStatus" AS ENUM ('OPEN', 'FILLED', 'SETTLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('HOLDING', 'RELEASED', 'FORFEITED');

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "capacityMin" INTEGER NOT NULL,
    "capacityMax" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeStatWeight" (
    "themeId" TEXT NOT NULL,
    "logic" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observe" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "speed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "story" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "solving" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tank" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ThemeStatWeight_pkey" PRIMARY KEY ("themeId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "mannerTemp" DOUBLE PRECISION NOT NULL DEFAULT 36.5,
    "level" INTEGER NOT NULL DEFAULT 1,
    "totalClears" INTEGER NOT NULL DEFAULT 0,
    "currentExp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStat" (
    "userId" TEXT NOT NULL,
    "logic" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "observe" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "speed" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "story" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "solving" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "tank" DOUBLE PRECISION NOT NULL DEFAULT 50,

    CONSTRAINT "UserStat_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserHistoryLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "status" "HistoryStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "partyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHistoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeReview" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "selectedTags" TEXT[],
    "votedHeadcount" INTEGER NOT NULL,
    "cleared" BOOLEAN NOT NULL,
    "remainingSec" INTEGER NOT NULL,
    "hintsUsed" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThemeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "reservedAt" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "totalPriceWon" INTEGER NOT NULL,
    "status" "PartyStatus" NOT NULL DEFAULT 'OPEN',
    "verifiedBookingOk" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyParticipant" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "depositWon" INTEGER NOT NULL,
    "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'HOLDING',
    "escrowTxRef" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartyParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ThemeReview_selectedTags_idx" ON "ThemeReview" USING GIN ("selectedTags");

-- CreateIndex
CREATE UNIQUE INDEX "PartyParticipant_partyId_userId_key" ON "PartyParticipant"("partyId", "userId");

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeStatWeight" ADD CONSTRAINT "ThemeStatWeight_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStat" ADD CONSTRAINT "UserStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistoryLog" ADD CONSTRAINT "UserHistoryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistoryLog" ADD CONSTRAINT "UserHistoryLog_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeReview" ADD CONSTRAINT "ThemeReview_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeReview" ADD CONSTRAINT "ThemeReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyParticipant" ADD CONSTRAINT "PartyParticipant_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyParticipant" ADD CONSTRAINT "PartyParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
