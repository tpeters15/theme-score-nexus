-- Phase 1: Security Hardening - Fix RLS Policies for Sensitive Data
-- This migration removes public read access and implements role-based access control

-- ============================================================================
-- 1. RAW SIGNALS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for raw signals" ON raw_signals;

CREATE POLICY "Analysts and admins can view raw signals" 
ON raw_signals 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- 2. PROCESSED SIGNALS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for processed signals" ON processed_signals;

CREATE POLICY "Analysts and admins can view processed signals" 
ON processed_signals 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- 3. SIGNALS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for signals" ON signals;

CREATE POLICY "Analysts and admins can view signals" 
ON signals 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- 4. INTELLIGENCE MEMOS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for intelligence memos" ON intelligence_memos;

-- Published memos are viewable by all authenticated users
CREATE POLICY "Published memos viewable by authenticated users" 
ON intelligence_memos 
FOR SELECT 
USING (
  status = 'published' AND auth.role() = 'authenticated'
);

-- Analysts and admins can view all memos (including drafts)
CREATE POLICY "Analysts and admins can view all memos" 
ON intelligence_memos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- 5. RESEARCH DOCUMENTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for research documents" ON research_documents;

CREATE POLICY "Analysts and admins can view research documents" 
ON research_documents 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- 6. DETAILED SCORES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Public read access for detailed scores" ON detailed_scores;

CREATE POLICY "Analysts and admins can view detailed scores" 
ON detailed_scores 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- 7. COMPANIES TABLE (CRITICAL - Contains proprietary deal data)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;

CREATE POLICY "Analysts and admins can view companies" 
ON companies 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- 8. ADDITIONAL TABLES WITH PUBLIC ACCESS
-- ============================================================================

-- Framework Categories (keep public for now as it's reference data)
-- Framework Criteria (keep public for now as it's reference data)
-- Taxonomy tables (keep public for now as it's reference data)

-- N8N Research Runs - restrict to analysts/admins
DROP POLICY IF EXISTS "Public read access for research runs" ON n8n_research_runs;

CREATE POLICY "Analysts and admins can view research runs" 
ON n8n_research_runs 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Sources - restrict to analysts/admins
DROP POLICY IF EXISTS "Public read access for sources" ON sources;

CREATE POLICY "Analysts and admins can view sources" 
ON sources 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Company Theme Mappings - restrict to analysts/admins
DROP POLICY IF EXISTS "Public read access for company theme mappings" ON company_theme_mappings;

CREATE POLICY "Analysts and admins can view company theme mappings" 
ON company_theme_mappings 
FOR SELECT 
USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);