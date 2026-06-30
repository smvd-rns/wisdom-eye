-- Run this SQL in your Supabase SQL Editor:
-- Adds quiz_show_correct_answers column to courses table (defaults to true = show answers)

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS quiz_show_correct_answers BOOLEAN NOT NULL DEFAULT TRUE;
