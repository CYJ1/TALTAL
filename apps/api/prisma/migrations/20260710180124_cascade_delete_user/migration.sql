-- DropForeignKey
ALTER TABLE "PartyParticipant" DROP CONSTRAINT "PartyParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "ThemeReview" DROP CONSTRAINT "ThemeReview_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserHistoryLog" DROP CONSTRAINT "UserHistoryLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserStat" DROP CONSTRAINT "UserStat_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserStat" ADD CONSTRAINT "UserStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHistoryLog" ADD CONSTRAINT "UserHistoryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeReview" ADD CONSTRAINT "ThemeReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyParticipant" ADD CONSTRAINT "PartyParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

