-- AlterTable
ALTER TABLE "ChatLog" ALTER COLUMN "response" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ChatLog_sessionId_idx" ON "ChatLog"("sessionId");
