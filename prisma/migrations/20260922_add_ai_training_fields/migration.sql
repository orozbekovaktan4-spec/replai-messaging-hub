-- AddColumn - AI Training Fields to Business model
ALTER TABLE "Business" ADD COLUMN "profileLinks" TEXT;
ALTER TABLE "Business" ADD COLUMN "aiTrainingData" TEXT;
ALTER TABLE "Business" ADD COLUMN "scrapedContent" TEXT;
