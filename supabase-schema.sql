-- ============================================
-- SMART VOTE SYSTEM — Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  must_change_password BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ELECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POSITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CANDIDATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  photo TEXT,
  bio TEXT,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VOTES TABLE (Anonymous — NO student identity)
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VOTING RECORDS (Tracks WHO voted, not WHAT)
-- ============================================
CREATE TABLE IF NOT EXISTS voting_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, election_id)
);

-- ============================================
-- ACTIVITY LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  details TEXT,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_positions_election ON positions(election_id);
CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_position ON votes(position_id);
CREATE INDEX IF NOT EXISTS idx_voting_records_student ON voting_records(student_id);
CREATE INDEX IF NOT EXISTS idx_voting_records_election ON voting_records(election_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- DEFAULT ADMIN (password: admin123, hashed with bcrypt)
-- ============================================
INSERT INTO admins (username, password, must_change_password)
VALUES ('admin', '$2b$12$RQIAFBadvYBBu.8QT.JZDOrKXw1r/WSQy1gGdz6RJow5EvWmGrGyS', true)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (our API uses service role key)
CREATE POLICY "Service role full access" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON elections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON positions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON candidates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON voting_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET FOR CANDIDATE PHOTOS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-photos', 'candidate-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to candidate photos
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'candidate-photos');

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'candidate-photos');

CREATE POLICY "Authenticated update access" ON storage.objects
  FOR UPDATE USING (bucket_id = 'candidate-photos');

CREATE POLICY "Authenticated delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'candidate-photos');
