-- Migration: Add Business Settings Fields
-- Date: 2026-11-21
-- Description: Adds fields for business settings, AI training, and knowledge base

-- Add description field
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Add phone field
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Add AI training fields
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "aiInstructions" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "knowledgeBase" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "aiProvider" TEXT DEFAULT 'groq';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "aiModel" TEXT DEFAULT 'llama-3.1-70b';

-- Add business hours field (stored as JSON text)
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "businessHours" TEXT;

-- Note: These are nullable fields, so existing records will have NULL values
-- which is handled gracefully by the application
