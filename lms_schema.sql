-- ============================================================
-- WISDOM EYE LMS — FULL DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- SECTION 1: USER PROFILES & ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  password_hash TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('superadmin', 'admin', 'course_builder', 'evaluator', 'student')),
  is_active BOOLEAN DEFAULT TRUE,
  current_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Who manages which course (course_builder/admin can be assigned)
CREATE TABLE IF NOT EXISTS course_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  user_id UUID NOT NULL,
  assigned_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- Which evaluator grades which quiz
CREATE TABLE IF NOT EXISTS quiz_evaluators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL,
  evaluator_user_id UUID NOT NULL,
  assigned_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, evaluator_user_id)
);

-- ============================================================
-- SECTION 2: COURSES, MODULES, LESSONS
-- ============================================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  category TEXT DEFAULT 'General',
  level TEXT DEFAULT 'beginner'
    CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  has_certificate BOOLEAN DEFAULT FALSE,
  certificate_image_url TEXT,
  total_lessons INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'youtube'
    CHECK (type IN ('youtube', 'gdrive', 'text')),
  content_url TEXT,
  content_text TEXT,
  description TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 3: ASSESSMENTS (QUIZZES & QUESTIONS)
-- ============================================================

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'mcq'
    CHECK (type IN ('mcq', 'subjective', 'mixed')),
  pass_score_percent INTEGER DEFAULT 60,
  time_limit_mins INTEGER,
  max_attempts INTEGER DEFAULT 3,
  show_correct_answers BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'mcq'
    CHECK (type IN ('mcq', 'subjective')),
  options JSONB,                 -- array of strings for MCQ
  correct_answer TEXT,           -- index or text for MCQ
  marks INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score DECIMAL(5,2) DEFAULT 0,
  total_marks INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('in_progress', 'submitted', 'auto_graded', 'pending_grade', 'graded')),
  graded_by UUID,
  evaluator_feedback TEXT,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ
);

-- ============================================================
-- SECTION 4: ENROLLMENTS & PROGRESS
-- ============================================================

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  payment_id UUID,
  coupon_id UUID,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  watch_seconds INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  percent_complete DECIMAL(5,2) DEFAULT 0,
  last_lesson_id UUID,
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_issued_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================================
-- SECTION 5: PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS lms_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  coupon_id UUID,
  original_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: COUPON SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'percent'
    CHECK (type IN ('percent', 'fixed', 'free')),
  discount_value DECIMAL(10,2) DEFAULT 0,
  applies_to TEXT DEFAULT 'all'
    CHECK (applies_to IN ('all', 'specific')),
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Which specific courses a coupon applies to (when applies_to = 'specific')
CREATE TABLE IF NOT EXISTS coupon_courses (
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (coupon_id, course_id)
);

-- Track who used which coupon
CREATE TABLE IF NOT EXISTS coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_id UUID,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);

-- ============================================================
-- SECTION 7: DISCUSSIONS / Q&A
-- ============================================================

CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  parent_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 8: INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_lesson_id ON discussions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ============================================================
-- SECTION 9: DATABASE MIGRATIONS (STREAKS & USER ACCESS)
-- ============================================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;
