# Lovable AI Context - Delta Metis Intelligence Platform

> **Purpose**: This document provides comprehensive context for the Lovable AI to understand the Delta Metis Intelligence Platform architecture, business logic, and technical implementation. Use this as the primary reference for all development work.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Architecture](#database-architecture)
3. [Edge Functions Registry](#edge-functions-registry)
4. [Business Logic & Algorithms](#business-logic--algorithms)
5. [Frontend Architecture](#frontend-architecture)
6. [Integration Points](#integration-points)
7. [Security Model](#security-model)
8. [Common Tasks & Patterns](#common-tasks--patterns)
9. [Technical Decisions & Rationale](#technical-decisions--rationale)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Overview

### What This System Does
Delta Metis is an **investment intelligence platform** for TowerBrook Capital Partners that:
- **Tracks market signals** (deals, regulations, news) from 30+ sources via n8n scraping
- **Classifies companies** into investment themes using AI (Claude 3.5 Sonnet)
- **Scores investment themes** using a proprietary 5-category framework (A-E)
- **Monitors regulations** and links them to affected themes
- **Syncs classifications** to DealCloud CRM
- **Generates intelligence memos** summarizing weekly market activity

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Scraping**: n8n workflows + Firecrawl AI extraction
- **AI**: Claude 3.5 Sonnet via Lovable API
- **CRM Integration**: DealCloud REST API
- **Hosting**: Lovable Cloud (frontend) + Supabase Cloud (backend)

### User Roles
- **Admin**: Full access, can manage taxonomy, users, and all data
- **Analyst**: Can view/edit signals, classify companies, update scores
- **User Authentication**: Supabase Auth with email/password + Google OAuth

---

## Database Architecture

### Core Schema Overview (24 Tables)

#### 1. Taxonomy Tables (Investment Classification Hierarchy)
```
taxonomy_pillars (3 pillars)
  ├── taxonomy_sectors (10-12 sectors)
      └── taxonomy_themes (40-50 themes)

taxonomy_business_models (15-20 independent business models)
```

**Key Tables**:

**`taxonomy_pillars`**
- Columns: `id`, `name`, `description`, `display_order`
- Example: "Decarbonisation", "Energy Transition", "Resource Sustainability"
- RLS: Public read, admin manage

**`taxonomy_sectors`**
- Columns: `id`, `pillar_id`, `name`, `description`, `display_order`
- Example: "EV Charging Infrastructure", "Industrial Efficiency"
- Foreign Key: `pillar_id` → `taxonomy_pillars.id`
- RLS: Public read, admin manage

**`taxonomy_themes`**
- Columns: `id`, `sector_id`, `name`, `description`, `impact`, `in_scope[]`, `out_of_scope[]`, `example_companies[]`, `common_edge_cases`, `key_identifiers[]`, `keywords[]`, `version`, `is_active`, `tam_value`, `tam_currency`, `cagr_percentage`, `cagr_period_start`, `cagr_period_end`, `market_maturity`
- Example: "EV Charging Hardware", "Battery Recycling"
- Foreign Key: `sector_id` → `taxonomy_sectors.id`
- **CRITICAL**: `in_scope` and `out_of_scope` arrays define precise boundaries for AI classification
- RLS: Public read, admin manage

**`taxonomy_business_models`**
- Columns: `id`, `name`, `description`
- Example: "SaaS", "Hardware", "Marketplace", "Services"
- **IMPORTANT**: Business models are INDEPENDENT tags, NOT theme-specific
- RLS: Public read, admin manage

#### 2. Company Classification Tables

**`companies`**
- Columns: `id`, `company_name`, `website_domain` (unique), `description`, `dealcloud_id`, `classification_status`, `classification_error_message`, `needs_dealcloud_sync`, `source_system`
- **Purpose**: Stores companies being classified
- Classification Status: `pending`, `in_progress`, `completed`, `failed`
- RLS: Authenticated insert/update, analysts/admins view

**`company_theme_mappings`**
- Columns: `id`, `company_id`, `theme_id`, `is_primary`, `confidence_score`, `is_positive_example`, `notes`, `classified_at`, `classified_by`, `synced_to_dealcloud`, `synced_at`, `dealcloud_sync_error`, `is_example`
- **Purpose**: Many-to-many relationship between companies and themes
- **Key Field**: `is_positive_example` - marks exemplary companies for AI training
- **Sync Logic**: Triggers DealCloud sync when updated
- RLS: Analysts create/update, admins delete

**`company_business_models`**
- Columns: `id`, `company_id`, `business_model_id`, `is_primary`, `confidence_score`, `is_positive_example`, `classification_method`, `notes`, `classified_at`, `classified_by`, `is_example`
- **Purpose**: Many-to-many relationship between companies and business models
- **Pattern**: Same structure as theme mappings for consistency
- RLS: Analysts create/update, admins delete

#### 3. Framework Scoring Tables (Proprietary Investment Evaluation)

**`framework_categories`**
- Columns: `id`, `code` (A-E), `name`, `description`, `weight`, `display_order`
- **Current Categories**:
  - A: Market Attractiveness (weight varies)
  - B: Fund Fit (weight varies)
  - C: Investability (weight varies)
  - D: Risk Profile (weight varies)
  - E: Impact/Right to Win (weight varies)
- **CRITICAL**: Categories A-D are used for overall theme scoring (E is excluded)
- RLS: Public read, admin manage

**`framework_criteria`**
- Columns: `id`, `category_id`, `code` (A1, A2, B1, etc.), `name`, `description`, `objective`, `weight`, `display_order`, `scoring_rubric` (JSON), `ai_prompt`
- **Scoring Rubric Structure**: `{ "1": {label, description}, "3": {label, description}, "5": {label, description} }`
- **Example Criteria**: "Market Size (TAM)", "CAGR Growth", "Fragmentation", "Regulatory Risk"
- **AI Prompt**: Used for LLM-powered research and scoring
- RLS: Public read, admin manage

**`detailed_scores`**
- Columns: `id`, `theme_id`, `criteria_id`, `score` (1/3/5), `confidence` (High/Medium/Low), `notes`, `ai_research_data` (JSON), `analyst_notes`, `updated_by`, `updated_at`, `update_source` (manual/llm_research/market_signal)
- **Purpose**: Stores granular scores for each theme-criteria combination
- **Unique Constraint**: One score per `(theme_id, criteria_id)` pair
- **Score Calculation**: Overall theme score = weighted average of categories A-D
- RLS: Analysts/admins manage, can delete

**`research_documents`**
- Columns: `id`, `theme_id`, `criteria_id`, `title`, `description`, `document_type`, `file_path`, `file_size`, `mime_type`, `created_by`
- **Purpose**: Attachments supporting framework scores
- **Storage**: Files in `research-documents` bucket (public)
- **Types**: "ai_research", "market_report", "analysis", etc.
- RLS: Analysts create/update own, admins full access

#### 4. Signal Tracking Tables (Market Intelligence)

**`sources`**
- Columns: `id`, `source_name`, `source_type` (rss/html_css/html_ai/api), `base_url`, `feed_url`, `api_endpoint`, `status`, `check_frequency`, `scraping_config` (JSON), `field_mappings` (JSON), `last_checked_at`, `last_success_at`, `error_message`, `created_by`
- **Purpose**: Defines scraping sources for n8n workflows
- **Source Types**:
  - `rss`: RSS/Atom feeds (simple parsing)
  - `html_css`: CSS selector-based extraction
  - `html_ai`: AI-powered content extraction via Firecrawl
  - `api`: Direct API integration
- **Scraping Config**: Source-specific configuration for n8n
- RLS: Analysts view, admins manage

**`raw_signals`**
- Columns: `id`, `signal_id` (unique fingerprint), `fingerprint`, `original_id`, `url`, `title`, `description`, `raw_content`, `source`, `source_id`, `source_type`, `author`, `publication_date`, `scraped_date`, `file_path`, `document_url`
- **Purpose**: Raw scraped data before processing
- **Deduplication**: `signal_id` and `fingerprint` prevent duplicates
- **Signal ID Format**: `{source}_{original_id}` or hash-based
- RLS: Analysts create/view, admins update/delete

**`processed_signals`**
- Columns: `id`, `raw_signal_id`, `signal_type_classified` (deal/regulatory/market_news/research), `countries[]`, `content_snippet`, `extracted_deal_size`, `is_featured`, `memo_section`, `memo_analysis`, `week_processed`, `memo_published_at`, `analysis_priority`, `credibility_score`, `has_pitchbook_data`, `content_length`, `days_old_when_processed`, `processed_timestamp`, `processed_by`
- **Purpose**: Enriched signals ready for analysis
- **Classification**: AI determines signal type and extracts structured data
- **Featured Signals**: Highlighted on dashboard (`is_featured = true`)
- RLS: Analysts create/update/view, admins delete

**`theme_signals`**
- Columns: `id`, `theme_id`, `processed_signal_id`, `relevance_score`, `ai_analysis`
- **Purpose**: Links signals to relevant themes for tracking
- **Relevance Score**: 0-100 based on AI analysis
- **Use Case**: "Show me all signals related to Battery Recycling theme"
- RLS: Analysts manage

#### 5. Regulatory Tracking Tables

**`regulations`**
- Columns: `id`, `title`, `description`, `jurisdiction`, `regulation_type`, `status`, `impact_level` (high/medium/low), `compliance_deadline`, `effective_date`, `source_url`, `analysis_url`, `regulatory_body`, `key_provisions[]`
- **Purpose**: Tracks regulations affecting investment themes
- **Impact Levels**: Determines priority for monitoring
- RLS: Public read, analysts/admins manage

**`theme_regulations`**
- Columns: `id`, `theme_id`, `regulation_id`, `relevance_score` (1-100), `impact_description`, `criteria_impacts[]` (which framework criteria affected)
- **Purpose**: Links regulations to themes with impact analysis
- **Criteria Impacts**: Array of framework codes (e.g., ["D1", "D2"] for regulatory risk)
- RLS: Public read, analysts/admins manage

#### 6. Intelligence Memos

**`intelligence_memos`**
- Columns: `id`, `week_start_date`, `week_end_date`, `status` (draft/published), `summary`, `market_news_section`, `deals_section`, `regulatory_section`, `signal_count`, `metadata` (JSON), `created_by`, `published_at`
- **Purpose**: Weekly intelligence summaries for stakeholders
- **Generation**: Aggregates featured signals by week
- **Metadata**: Stores rendering preferences, theme focus areas, etc.
- RLS: Analysts create/update, authenticated users view published

#### 7. DealCloud Integration Tables

**`dealcloud_theme_mapping`**
- Columns: `id`, `dealcloud_entry_id` (bigint), `dealcloud_object_id` (default 94467), `theme_name`, `sector_name`, `sector_entry_id`
- **Purpose**: Maps Delta Metis themes to DealCloud list entries
- **Critical**: Ensures correct theme IDs when syncing company classifications
- RLS: Analysts view, admins manage

**`dealcloud_sync_log`**
- Columns: `id`, `company_id`, `dealcloud_entry_id`, `sync_status`, `request_payload` (JSON), `response_payload` (JSON), `error_message`, `synced_at`
- **Purpose**: Audit trail for DealCloud API calls
- **Debugging**: Check this table when sync fails
- RLS: Admins only

#### 8. User & Access Control

**`profiles`**
- Columns: `id` (matches auth.users), `email`, `full_name`, `avatar_url`
- **Purpose**: Public user information
- **Trigger**: Auto-created on auth signup via `handle_new_user()`
- RLS: Users view/update own, admins view all

**`user_roles`**
- Columns: `id`, `user_id`, `role` (enum: admin/analyst)
- **Purpose**: Role-based access control
- **CRITICAL**: Uses `has_role()` security definer function to avoid RLS recursion
- **Pattern**: Never query this table directly in RLS policies
- RLS: Public read, admins manage

### Database Functions

**`has_role(_user_id uuid, _role app_role)`**
- **Type**: SECURITY DEFINER function
- **Purpose**: Check user role without RLS recursion
- **Usage**: `WHERE has_role(auth.uid(), 'admin'::app_role)`
- **Critical**: All role checks MUST use this function

**`update_updated_at_column()`**
- **Type**: Trigger function
- **Purpose**: Auto-update `updated_at` timestamps
- **Applied to**: Most tables with `updated_at` column

**`get_taxonomy_json()`**
- **Purpose**: Returns complete taxonomy hierarchy as JSON
- **Used by**: n8n workflows, classification edge functions
- **Performance**: Indexed queries, cached by edge functions

**`get_business_models_json()`**
- **Purpose**: Returns all business models as JSON array
- **Used by**: Classification edge functions

**`trigger_dealcloud_sync()`**
- **Type**: Trigger on `company_theme_mappings` INSERT/UPDATE
- **Purpose**: Calls n8n webhook for DealCloud sync
- **Condition**: Only triggers if `dealcloud_id` exists and `needs_dealcloud_sync = true`

### Database Views

**`detailed_scores_with_context`**
- **Purpose**: Joins scores with theme/criteria/category names for reporting
- **Columns**: All from `detailed_scores` + `theme_name`, `sector_id`, `category_code`, `category_name`, `criteria_code`, `criteria_name`
- **Use**: Dashboard queries, analytics, Excel exports

---

## Edge Functions Registry

All edge functions are in `supabase/functions/` and deployed automatically. All functions have `verify_jwt = false` in `config.toml`.

### 1. **classify-company**
- **Path**: `/functions/v1/classify-company`
- **Purpose**: AI-powered company classification into themes and business models
- **Input**: `{ companyId, companyName, website, business_description }`
- **Process**:
  1. Fetch taxonomy via `get_taxonomy_json()`
  2. Fetch business models via `get_business_models_json()`
  3. Call Claude 3.5 Sonnet with classification prompt
  4. Parse AI response (JSON with themes and business models)
  5. Insert into `company_theme_mappings` and `company_business_models`
  6. Update `companies.classification_status = 'completed'`
- **Error Handling**: Sets `classification_status = 'failed'` with error message
- **Secrets**: `LOVABLE_API_KEY`

### 2. **get-taxonomy** & **get-business-models**
- **Path**: `/functions/v1/get-taxonomy`, `/functions/v1/get-business-models`
- **Purpose**: Public API endpoints for taxonomy data
- **Output**: Full taxonomy hierarchy and business models as JSON
- **Used by**: Frontend forms, external integrations, n8n
- **Caching**: Should implement edge function caching for performance

### 3. **get-taxonomy-for-n8n**
- **Path**: `/functions/v1/get-taxonomy-for-n8n`
- **Purpose**: Simplified taxonomy format for n8n scraping workflows
- **Output**: Flat list of themes with keywords and identifiers
- **Use Case**: n8n matches scraped signals to themes using keywords

### 4. **scrape-carbon-brief** & **scrape-iea-sources**
- **Path**: `/functions/v1/scrape-carbon-brief`, `/functions/v1/scrape-iea-sources`
- **Purpose**: Source-specific scrapers for Carbon Brief and IEA
- **Pattern**: Fetch RSS/HTML → Parse → Insert into `raw_signals`
- **Deduplication**: Check `signal_id` before insert
- **Status**: Legacy functions, replaced by universal n8n workflow

### 5. **analyze-signal-themes**
- **Path**: `/functions/v1/analyze-signal-themes`
- **Purpose**: AI analysis to link processed signals to themes
- **Input**: `{ processed_signal_id }`
- **Process**:
  1. Fetch signal content and taxonomy
  2. Call Claude to identify relevant themes
  3. Parse AI response with relevance scores
  4. Insert into `theme_signals`
- **Secrets**: `LOVABLE_API_KEY`

### 6. **map-signals-to-theme**
- **Path**: `/functions/v1/map-signals-to-theme`
- **Purpose**: Batch link signals to a specific theme
- **Input**: `{ theme_id, signal_ids[] }`
- **Use Case**: Manual curation by analysts

### 7. **populate-theme-signals** & **populate-dashboard-theme-signals**
- **Path**: `/functions/v1/populate-theme-signals`, `/functions/v1/populate-dashboard-theme-signals`
- **Purpose**: Bulk operations for signal-theme linking
- **Use Case**: Data migration, bulk imports
- **Note**: Should be used carefully (can create duplicates)

### 8. **remove-theme-signal**
- **Path**: `/functions/v1/remove-theme-signal`
- **Purpose**: Remove signal-theme link
- **Input**: `{ theme_signal_id }`

### 9. **populate-sources-from-signals**
- **Path**: `/functions/v1/populate-sources-from-signals`
- **Purpose**: Auto-create source records from existing signals
- **Use Case**: Data cleanup, migration from legacy system

### 10. **import-processed-signals-csv**
- **Path**: `/functions/v1/import-processed-signals-csv`
- **Purpose**: Bulk import signals from CSV file
- **Input**: CSV with columns: `title, description, source, publication_date, signal_type, countries, deal_size`
- **Process**: Parse CSV → Insert into `raw_signals` + `processed_signals`
- **Secrets**: None (file upload via Storage)

### 11. **upload-research-document**
- **Path**: `/functions/v1/upload-research-document`
- **Purpose**: Upload PDF/DOCX to `research-documents` bucket
- **Input**: `{ theme_id, criteria_id, file, title, description, document_type }`
- **Process**: Upload to Storage → Insert metadata into `research_documents`
- **Storage**: `research-documents` bucket (public)

### 12. **bulk-score-update**
- **Path**: `/functions/v1/bulk-score-update`
- **Purpose**: Update multiple framework scores in one transaction
- **Input**: `{ theme_id, scores: [{ criteria_id, score, confidence, notes }] }`
- **Process**: Upsert each score into `detailed_scores`
- **Performance**: Single transaction for consistency

### 13. **dealcloud-webhook**
- **Path**: `/functions/v1/dealcloud-webhook`
- **Purpose**: Webhook receiver for DealCloud events (future use)
- **Status**: Placeholder, not yet implemented

### 14. **dealcloud-write-back**
- **Path**: `/functions/v1/dealcloud-write-back` (referenced in code summary)
- **Purpose**: Proxy for writing classification data to DealCloud API
- **Input**: `{ dealcloud_id, classification: { themes, business_models } }`
- **Secrets**: `DEALCLOUD_API_KEY`, `DEALCLOUD_API_URL`
- **Status**: Placeholder with TODO for actual integration

### 15. **cors-proxy**
- **Path**: `/functions/v1/cors-proxy`
- **Purpose**: CORS proxy for frontend API calls to external services
- **Input**: `{ url, method, headers, body }`
- **Use Case**: Bypass CORS restrictions

### Edge Function Patterns

**CORS Headers** (all functions):
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Supabase Client** (service role):
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
```

**Error Handling Pattern**:
```typescript
try {
  // ... function logic
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
} catch (error) {
  return new Response(JSON.stringify({ error: error.message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500,
  })
}
```

---

## Business Logic & Algorithms

### 1. Framework Scoring Algorithm

**Overall Theme Score Calculation**:
```typescript
// Uses ONLY categories A-D (Market, Fund Fit, Investability, Risk)
// Category E (Impact/Right to Win) is excluded from overall score

const calculateOverallScore = (
  detailedScores: DetailedScore[],
  categories: FrameworkCategory[]
) => {
  // Filter to categories A-D only
  const scoringCategories = categories.filter(cat => 
    ['A', 'B', 'C', 'D'].includes(cat.code)
  )
  
  // Calculate weighted average by category
  const categoryScores = scoringCategories.map(category => {
    const criteriaInCategory = category.criteria
    const scoresInCategory = detailedScores.filter(score =>
      criteriaInCategory.some(c => c.id === score.criteria_id)
    )
    
    if (scoresInCategory.length === 0) return null
    
    // Weighted average within category
    const totalWeight = criteriaInCategory.reduce((sum, c) => sum + c.weight, 0)
    const weightedSum = scoresInCategory.reduce((sum, score) => {
      const criteria = criteriaInCategory.find(c => c.id === score.criteria_id)
      return sum + (score.score * criteria.weight)
    }, 0)
    
    return {
      categoryWeight: category.weight,
      categoryScore: weightedSum / totalWeight
    }
  }).filter(s => s !== null)
  
  // Final weighted average across categories
  const totalCategoryWeight = categoryScores.reduce((sum, s) => sum + s.categoryWeight, 0)
  const overallScore = categoryScores.reduce((sum, s) => 
    sum + (s.categoryScore * s.categoryWeight), 0
  ) / totalCategoryWeight
  
  return Math.round(overallScore) // Round to nearest integer (1-5 scale)
}
```

**Confidence Calculation**:
```typescript
// Overall confidence = lowest confidence among all scores
// "High" > "Medium" > "Low"

const calculateOverallConfidence = (detailedScores: DetailedScore[]) => {
  const confidenceLevels = detailedScores.map(s => s.confidence)
  
  if (confidenceLevels.includes('Low')) return 'Low'
  if (confidenceLevels.includes('Medium')) return 'Medium'
  return 'High'
}
```

**Score Thresholds** (for UI color coding):
```typescript
const SCORE_THRESHOLDS = {
  HIGH: 70,    // Green (strong investment opportunity)
  MEDIUM: 40,  // Yellow (moderate opportunity)
  // Below 40: Red (weak opportunity)
}
```

### 2. Company Classification Algorithm

**Input**: Company name, website, business description

**Process**:
1. **Fetch Taxonomy Context**:
   ```typescript
   const taxonomy = await supabase.rpc('get_taxonomy_json')
   const businessModels = await supabase.rpc('get_business_models_json')
   ```

2. **Construct Classification Prompt**:
   ```typescript
   const prompt = `
   You are an expert in sustainable infrastructure investments.
   
   Company: ${companyName}
   Website: ${website}
   Description: ${description}
   
   Taxonomy:
   ${JSON.stringify(taxonomy, null, 2)}
   
   Business Models:
   ${JSON.stringify(businessModels, null, 2)}
   
   Classify this company:
   1. Which themes does it fit? (can be multiple)
      - Use in_scope/out_of_scope/example_companies to determine fit
      - Provide confidence score (0-100) for each theme
      - Mark the PRIMARY theme (most relevant)
   
   2. Which business models apply? (can be multiple)
      - Mark the PRIMARY business model
   
   3. Is this company a positive example for any themes?
      - Mark if it's an exemplary case for training data
   
   Respond with JSON:
   {
     "themes": [
       {
         "theme_id": "uuid",
         "theme_name": "string",
         "is_primary": boolean,
         "confidence_score": number,
         "is_positive_example": boolean,
         "notes": "explanation"
       }
     ],
     "business_models": [
       {
         "business_model_id": "uuid",
         "business_model_name": "string",
         "is_primary": boolean,
         "confidence_score": number,
         "notes": "explanation"
       }
     ]
   }
   `
   ```

3. **Call AI & Parse Response**:
   ```typescript
   const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${LOVABLE_API_KEY}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       model: 'claude-3.5-sonnet',
       messages: [{ role: 'user', content: prompt }],
       temperature: 0.3 // Lower temperature for consistent classification
     })
   })
   
   const aiResult = JSON.parse(response.choices[0].message.content)
   ```

4. **Insert Classifications**:
   ```typescript
   // Insert theme mappings
   for (const theme of aiResult.themes) {
     await supabase.from('company_theme_mappings').insert({
       company_id: companyId,
       theme_id: theme.theme_id,
       is_primary: theme.is_primary,
       confidence_score: theme.confidence_score,
       is_positive_example: theme.is_positive_example,
       notes: theme.notes,
       classified_by: userId,
       classification_method: 'ai'
     })
   }
   
   // Insert business model mappings
   for (const bm of aiResult.business_models) {
     await supabase.from('company_business_models').insert({
       company_id: companyId,
       business_model_id: bm.business_model_id,
       is_primary: bm.is_primary,
       confidence_score: bm.confidence_score,
       notes: bm.notes,
       classified_by: userId,
       classification_method: 'ai'
     })
   }
   ```

5. **Trigger DealCloud Sync** (via database trigger):
   ```sql
   -- Automatically calls n8n webhook if dealcloud_id exists
   ```

### 3. Signal Processing Pipeline

**Stage 1: Raw Signal Ingestion**
```typescript
// n8n workflow → Edge function OR direct DB insert
INSERT INTO raw_signals (
  signal_id,      // Unique: {source}_{original_id} or hash
  fingerprint,    // MD5 hash of title+content for deduplication
  title,
  description,
  raw_content,
  source,
  source_id,
  url,
  publication_date,
  scraped_date
)
ON CONFLICT (signal_id) DO NOTHING  // Prevent duplicates
```

**Stage 2: Signal Classification**
```typescript
// AI classifies signal type and extracts structured data
const classifySignal = async (rawSignalId: string) => {
  const signal = await fetchRawSignal(rawSignalId)
  
  const prompt = `
  Classify this market signal:
  
  Title: ${signal.title}
  Content: ${signal.description}
  Source: ${signal.source}
  
  Determine:
  1. Signal Type: deal | regulatory | market_news | research
  2. Countries mentioned (ISO codes)
  3. Deal size if applicable (e.g., "$50M Series B")
  4. Content quality/credibility (0-100)
  5. Brief summary (2-3 sentences)
  
  JSON Response:
  {
    "signal_type": "deal",
    "countries": ["GB", "US"],
    "deal_size": "$50M Series B",
    "credibility_score": 85,
    "content_snippet": "..."
  }
  `
  
  const result = await callAI(prompt)
  
  await supabase.from('processed_signals').insert({
    raw_signal_id: rawSignalId,
    signal_type_classified: result.signal_type,
    countries: result.countries,
    extracted_deal_size: result.deal_size,
    credibility_score: result.credibility_score,
    content_snippet: result.content_snippet,
    processed_by: userId
  })
}
```

**Stage 3: Theme Mapping**
```typescript
// Link signals to relevant themes
const mapSignalToThemes = async (processedSignalId: string) => {
  const signal = await fetchProcessedSignal(processedSignalId)
  const themes = await fetchAllThemes()
  
  const prompt = `
  Match this signal to relevant investment themes:
  
  Signal: ${signal.title}
  Summary: ${signal.content_snippet}
  
  Themes:
  ${themes.map(t => `- ${t.name}: ${t.description}`).join('\n')}
  
  For each relevant theme, provide:
  - relevance_score (0-100)
  - brief analysis of why it's relevant
  
  JSON Response:
  {
    "theme_matches": [
      {
        "theme_id": "uuid",
        "relevance_score": 85,
        "analysis": "This deal indicates growing demand for..."
      }
    ]
  }
  `
  
  const result = await callAI(prompt)
  
  for (const match of result.theme_matches) {
    await supabase.from('theme_signals').insert({
      processed_signal_id: processedSignalId,
      theme_id: match.theme_id,
      relevance_score: match.relevance_score,
      ai_analysis: match.analysis
    })
  }
}
```

**Stage 4: Memo Generation** (Weekly Intelligence Summary)
```typescript
const generateWeeklyMemo = async (weekStartDate: Date) => {
  // Fetch featured signals from the week
  const signals = await supabase
    .from('processed_signals')
    .select('*, raw_signal(*), theme_signals(theme_id, ai_analysis)')
    .eq('is_featured', true)
    .gte('processed_timestamp', weekStartDate)
    .lt('processed_timestamp', addDays(weekStartDate, 7))
  
  // Group by signal type
  const dealSignals = signals.filter(s => s.signal_type_classified === 'deal')
  const regulatorySignals = signals.filter(s => s.signal_type_classified === 'regulatory')
  const newsSignals = signals.filter(s => s.signal_type_classified === 'market_news')
  
  // Generate AI summaries for each section
  const dealsSummary = await generateSection(dealSignals, 'deals')
  const regulatorySummary = await generateSection(regulatorySignals, 'regulatory')
  const newsSummary = await generateSection(newsSignals, 'market_news')
  
  // Create memo record
  await supabase.from('intelligence_memos').insert({
    week_start_date: weekStartDate,
    week_end_date: addDays(weekStartDate, 6),
    deals_section: dealsSummary,
    regulatory_section: regulatorySummary,
    market_news_section: newsSummary,
    signal_count: signals.length,
    status: 'draft',
    created_by: userId
  })
}
```

### 4. Deduplication Strategy

**Signal Fingerprinting**:
```typescript
import { createHash } from 'crypto'

const generateFingerprint = (title: string, content: string): string => {
  const normalized = `${title.toLowerCase().trim()}${content.toLowerCase().trim()}`
  return createHash('md5').update(normalized).digest('hex')
}

const generateSignalId = (source: string, originalId?: string): string => {
  if (originalId) {
    return `${source}_${originalId}`
  }
  // Fallback: hash-based ID
  return `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

**Duplicate Detection**:
```sql
-- Check before insert
SELECT id FROM raw_signals 
WHERE signal_id = $1 
   OR fingerprint = $2
LIMIT 1

-- If exists, skip insert
-- If not, INSERT with ON CONFLICT DO NOTHING as safety net
```

---

## Frontend Architecture

### Routing Structure (React Router v6)
```
/                        → Index (Dashboard)
/auth                    → Auth (Login/Signup)
/themes                  → Themes (List view with scoring)
/themes/:id              → ThemeProfile (Detailed framework scores)
/signals                 → Signals (Processed signals table)
/regulatory-tracker      → RegulatoryTracker (Regulations & impact)
/research                → Research (Document library)
/classifier              → Classifier (Company classification tool)
/taxonomy-management     → TaxonomyManagement (Admin: edit taxonomy)
/source-monitors         → SourceMonitors (View/manage scraping sources)
/source-monitors/:id     → SourceProfile (Source details & runs)
/scraper-management      → ScraperManagement (Visual scraper builder)
/theme-populator         → ThemePopulator (Bulk data operations)
```

### Component Architecture Patterns

**Layout Components**:
- `AppLayout`: Main layout with sidebar navigation
- `AppSidebar`: Collapsible navigation menu
- `DashboardHeader`: Page headers with breadcrumbs
- `ProtectedRoute`: Auth wrapper for private pages

**Data Display Components**:
- `BasicDataTable`: Generic table with sorting/filtering
- `SignalsTableView`: Signals with advanced filtering
- `ThemeTableView`: Themes with score visualization
- `SourcesTableView`: Sources with status indicators
- `RegulatoryTable`: Regulations with impact levels

**Modal Components**:
- `SignalDetailModal`: Full signal content view
- `ProcessedSignalDetailModal`: Processed signal with classification
- `ThemeDetailModal`: Theme definition and scope
- `DetailedFrameworkModal`: Full framework scoring breakdown
- `IntelligenceMemoModal`: Weekly memo viewer
- `ClassificationDetailModal`: Company classification results

**Feature Components**:
- `ExecutiveDashboard`: KPIs, charts, featured signals
- `ThemeDashboard`: Theme-specific analytics
- `IntelligenceFeed`: Real-time signal stream
- `DocumentViewer`: PDF/DOCX viewer for research docs
- `BulkScoringModal`: Batch framework score updates

**Admin Tools**:
- `PopulateThemeSignalsButton`: Bulk signal-theme linking
- `PopulateSourcesButton`: Generate sources from signals
- `ImportProcessedSignalsCSV`: CSV import tool
- `BulkScoreUpdateButton`: Batch score updates
- `ThemeFileUpload`: CSV import for themes

### State Management Patterns

**React Query (TanStack Query)**:
```typescript
// All data fetching uses React Query for caching and invalidation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Example: Fetch themes
export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taxonomy_themes')
        .select('*, sector:taxonomy_sectors(*, pillar:taxonomy_pillars(*))')
        .eq('is_active', true)
      
      if (error) throw error
      return data
    },
  })
}

// Example: Update theme score
export function useUpdateScore() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ themeId, criteriaId, score, confidence, notes }) => {
      const { data, error } = await supabase
        .from('detailed_scores')
        .upsert({
          theme_id: themeId,
          criteria_id: criteriaId,
          score,
          confidence,
          notes,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'theme_id,criteria_id'
        })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate related queries to trigger refetch
      queryClient.invalidateQueries(['themes'])
      queryClient.invalidateQueries(['framework-scores'])
    }
  })
}
```

**Custom Hooks** (in `src/hooks/`):
- `useFramework`: Fetches framework categories, criteria, scores
- `useThemes`: Fetches themes with calculated overall scores
- `useTaxonomy`: Fetches full taxonomy hierarchy
- `useRawSignals`: Fetches raw signals
- `useProcessedSignals`: Fetches processed signals
- `useProcessedSignalsFeatured`: Fetches featured signals
- `useRegulations`: Fetches regulations
- `useHighImpactRegulations`: Fetches high-impact regulations
- `useResearchDocuments`: Fetches research documents
- `useSources`: Fetches scraping sources

**Context Providers**:
- `AuthContext`: User authentication state, login/logout functions
  ```typescript
  const { user, userRole, loading, signIn, signOut } = useAuth()
  ```

### UI Component Library (shadcn/ui)

**Design System** (`src/index.css`):
```css
:root {
  /* Semantic color tokens */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
  
  /* Component-specific tokens */
  --card: 0 0% 100%;
  --popover: 0 0% 100%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}

.dark {
  /* Dark mode overrides */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

**Critical UI Patterns**:
- **Color Usage**: ALWAYS use semantic tokens (`bg-background`, `text-foreground`), NEVER direct colors
- **Responsive**: Mobile-first with `md:`, `lg:` breakpoints
- **Dark Mode**: Automatic via `next-themes` provider
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

**Key UI Components** (in `src/components/ui/`):
- `Button`: Primary, secondary, outline, ghost variants
- `Card`: Container with header/footer
- `Dialog`: Modal overlays
- `Table`: Sortable tables with pagination
- `Badge`: Status indicators
- `Select`, `Input`, `Textarea`: Form controls
- `Toast` (Sonner): Notifications
- `Tabs`: Content switching
- `Accordion`: Collapsible sections
- `Popover`, `Tooltip`: Contextual info

---

## Integration Points

### 1. n8n Scraping Workflows

**Architecture**: Universal scraper workflow handles all source types

**Workflow URL**: `https://towerbrook.app.n8n.cloud/webhook/universal-scraper`

**Source Configuration** (stored in `sources` table):
```json
{
  "source_type": "html_ai",
  "scraping_config": {
    "extraction_type": "ai",
    "firecrawl_api_key_ref": "FIRECRAWL_API_KEY",
    "extraction_prompt": "Extract deal announcements from this page. For each deal, extract: company name, deal size, investors, date, description.",
    "extraction_schema": {
      "type": "object",
      "properties": {
        "deals": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "company_name": { "type": "string" },
              "deal_size": { "type": "string" },
              "investors": { "type": "array" },
              "date": { "type": "string" },
              "description": { "type": "string" }
            }
          }
        }
      }
    }
  },
  "field_mappings": {
    "title": "{{$json.company_name}} raises {{$json.deal_size}}",
    "description": "{{$json.description}}",
    "publication_date": "{{$json.date}}"
  }
}
```

**n8n Workflow Steps**:
1. **Schedule Trigger**: Runs hourly/daily based on `check_frequency`
2. **Fetch Sources**: Query `sources` table for active sources
3. **Route by Type**: Switch node based on `source_type`
4. **Extract Content**:
   - RSS: Parse feed XML
   - HTML CSS: CSS selector extraction
   - HTML AI: Firecrawl API + Claude extraction
   - API: Direct API call
5. **Transform to Signal Schema**: Map extracted fields to `raw_signals` columns
6. **Deduplicate**: Check `signal_id` and `fingerprint`
7. **Insert to DB**: Bulk insert into `raw_signals`
8. **Update Source Status**: Set `last_checked_at`, `last_success_at`, or `error_message`

**Firecrawl Integration**:
```typescript
// n8n HTTP Request node
POST https://api.firecrawl.dev/v1/scrape
Headers: {
  Authorization: Bearer ${FIRECRAWL_API_KEY}
}
Body: {
  url: "{{$json.base_url}}",
  formats: ["markdown"],
  actions: [], // Optional: click buttons, fill forms
  onlyMainContent: true,
  includeTags: ["article", "main"],
  excludeTags: ["nav", "footer", "aside"]
}

// Firecrawl AI Extract
POST https://api.firecrawl.dev/v1/extract
Body: {
  urls: ["{{$json.base_url}}"],
  prompt: "{{$json.scraping_config.extraction_prompt}}",
  schema: {{$json.scraping_config.extraction_schema}}
}
```

**Error Handling**:
```typescript
// n8n error catching
try {
  // ... scraping logic
} catch (error) {
  await supabase.from('sources').update({
    id: sourceId,
    error_message: error.message,
    status: 'error'
  })
  
  // Send alert to Slack/email (optional)
}
```

### 2. DealCloud Integration

**Architecture**: n8n webhook → DealCloud REST API

**Sync Trigger**: Database trigger on `company_theme_mappings` INSERT/UPDATE

**Sync Workflow**:
1. **Database Trigger**: Calls `trigger_dealcloud_sync()` function
2. **Function Checks**: Only sync if `dealcloud_id` exists and `needs_dealcloud_sync = true`
3. **HTTP POST**: Calls n8n webhook with payload:
   ```json
   {
     "dealcloud_id": "12345",
     "theme_id": "uuid-of-theme",
     "confidence_score": 85
   }
   ```
4. **n8n Workflow**:
   - Lookup theme in `dealcloud_theme_mapping` to get `dealcloud_entry_id`
   - Call DealCloud API to update company record:
     ```http
     PATCH https://api.dealcloud.com/v1/companies/{dealcloud_id}
     Headers: {
       Authorization: Bearer ${DEALCLOUD_API_TOKEN}
       Content-Type: application/json
     }
     Body: {
       "custom_fields": {
         "94467": [dealcloud_entry_id] // Object 94467 = Investment Themes list
       }
     }
     ```
   - Log sync result to `dealcloud_sync_log`

**Mapping Table**:
```sql
-- Example: EV Charging Hardware theme
INSERT INTO dealcloud_theme_mapping (
  dealcloud_entry_id,  -- DealCloud list entry ID
  dealcloud_object_id, -- Always 94467 (Investment Themes object)
  theme_name,          -- "EV Charging Hardware"
  sector_name,         -- "EV Charging Infrastructure"
  sector_entry_id      -- DealCloud sector list entry ID (if hierarchical)
) VALUES (
  789012,
  94467,
  'EV Charging Hardware',
  'EV Charging Infrastructure',
  456789
);
```

**Sync Status Tracking**:
```typescript
// After sync attempt
await supabase.from('company_theme_mappings').update({
  id: mappingId,
  synced_to_dealcloud: success,
  synced_at: new Date().toISOString(),
  dealcloud_sync_error: error?.message || null
})

await supabase.from('dealcloud_sync_log').insert({
  company_id: companyId,
  dealcloud_entry_id: themeMappingEntryId,
  sync_status: success ? 'success' : 'failed',
  request_payload: requestPayload,
  response_payload: responsePayload,
  error_message: error?.message
})
```

### 3. AI Services (Claude via Lovable API)

**API Endpoint**: `https://api.lovable.dev/v1/chat/completions`

**Authentication**: `Authorization: Bearer ${LOVABLE_API_KEY}`

**Model**: `claude-3.5-sonnet` (default for all tasks)

**Common Prompts**:

**Company Classification**:
```typescript
{
  model: 'claude-3.5-sonnet',
  messages: [{
    role: 'user',
    content: `Classify company into investment themes. Company: ${name}. Description: ${desc}. Taxonomy: ${JSON.stringify(taxonomy)}. Respond with JSON: { themes: [...], business_models: [...] }`
  }],
  temperature: 0.3,  // Lower = more consistent
  max_tokens: 2000
}
```

**Signal Analysis**:
```typescript
{
  model: 'claude-3.5-sonnet',
  messages: [{
    role: 'user',
    content: `Analyze this market signal for investment relevance. Signal: ${title}. Content: ${content}. Determine signal type (deal/regulatory/news), extract countries, deal size, credibility score (0-100), and summarize in 2-3 sentences. Respond with JSON.`
  }],
  temperature: 0.4,
  max_tokens: 1500
}
```

**Theme-Signal Matching**:
```typescript
{
  model: 'claude-3.5-sonnet',
  messages: [{
    role: 'user',
    content: `Match this signal to relevant investment themes. Signal: ${signal}. Themes: ${themes}. For each relevant theme, provide relevance score (0-100) and analysis. Respond with JSON: { theme_matches: [{ theme_id, relevance_score, analysis }] }`
  }],
  temperature: 0.5,
  max_tokens: 2000
}
```

**Best Practices**:
- **Temperature**: 0.3-0.5 for classification, 0.7-0.9 for creative content
- **Max Tokens**: Set based on expected response length to control costs
- **Error Handling**: Retry up to 3 times with exponential backoff
- **Rate Limiting**: Implement queue for batch operations
- **Prompt Engineering**: Include examples, specify JSON format, use clear instructions

---

## Security Model

### Authentication (Supabase Auth)

**Providers Enabled**:
- Email/Password (primary)
- Google OAuth (secondary)

**Protected Routes**:
- All routes except `/auth` require authentication
- `ProtectedRoute` component wraps authenticated pages:
  ```typescript
  <ProtectedRoute>
    <ThemesPage />
  </ProtectedRoute>
  ```

**Auth Context**:
```typescript
const { user, userRole, loading, signIn, signOut } = useAuth()

// User object
user: {
  id: string,
  email: string,
  user_metadata: { full_name: string }
}

// Role
userRole: 'admin' | 'analyst' | null
```

### Authorization (Row-Level Security)

**Role Hierarchy**:
1. **Admin**: Full access to all data and operations
2. **Analyst**: Can view/edit signals, classify companies, update scores
3. **Unauthenticated**: No access (all tables require auth)

**RLS Pattern** (avoid recursion):
```sql
-- WRONG: Causes infinite recursion
CREATE POLICY "Admins can view all" ON profiles
FOR SELECT USING (
  (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- CORRECT: Use security definer function
CREATE POLICY "Admins can view all" ON profiles
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role)
);
```

**Common Policy Patterns**:

**Admin-only management**:
```sql
CREATE POLICY "Admins can manage" ON taxonomy_pillars
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
```

**Analyst/Admin shared access**:
```sql
CREATE POLICY "Analysts and admins can view" ON processed_signals
FOR SELECT USING (
  has_role(auth.uid(), 'analyst'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);
```

**Public read, authenticated write**:
```sql
CREATE POLICY "Public read" ON taxonomy_themes
FOR SELECT USING (true);

CREATE POLICY "Admins can write" ON taxonomy_themes
FOR INSERT USING (has_role(auth.uid(), 'admin'::app_role));
```

**User-scoped data**:
```sql
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);
```

### Data Validation

**Frontend Validation** (Zod schemas):
```typescript
import { z } from 'zod'

const companySchema = z.object({
  company_name: z.string().min(1, 'Company name required'),
  website_domain: z.string().url('Invalid URL').optional(),
  description: z.string().optional(),
})

// Use in forms
const form = useForm({
  resolver: zodResolver(companySchema),
})
```

**Database Constraints**:
- `NOT NULL` on critical fields (name, created_at, etc.)
- `UNIQUE` constraints (website_domain, signal_id, fingerprint)
- `FOREIGN KEY` with `ON DELETE CASCADE` for cleanup
- `CHECK` constraints for enums (role, status, etc.)

**Edge Function Validation**:
```typescript
// Validate input before processing
if (!companyId || !companyName) {
  return new Response(
    JSON.stringify({ error: 'Missing required fields' }),
    { status: 400 }
  )
}

// Validate user permissions (if needed)
const { data: userRole } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .single()

if (!userRole || !['admin', 'analyst'].includes(userRole.role)) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 403 }
  )
}
```

---

## Common Tasks & Patterns

### Adding a New Theme

1. **Admin navigates to Taxonomy Management** (`/taxonomy-management`)
2. **Select sector** (or create new sector if needed)
3. **Create theme** with required fields:
   - Name, description, impact statement
   - In-scope criteria (array of strings)
   - Out-of-scope criteria (array of strings)
   - Example companies (array of strings)
   - Key identifiers (array of strings for AI matching)
   - Common edge cases (text guidance for classification)
4. **System auto-creates framework score rows**:
   ```sql
   -- Trigger creates detailed_scores entries for all criteria
   INSERT INTO detailed_scores (theme_id, criteria_id, score, confidence)
   SELECT $theme_id, id, NULL, NULL
   FROM framework_criteria
   ```

### Classifying a Company

**Manual Classification** (UI):
1. Navigate to `/classifier`
2. Enter company details or upload CSV
3. Click "Classify" → calls `classify-company` edge function
4. Review results → adjust if needed
5. Save to database

**Batch Classification** (CSV):
1. Upload CSV with columns: `company_name, website_domain, description, dealcloud_id`
2. System processes each row via `classify-company` function
3. Results displayed in `BatchClassificationResults` component
4. Can bulk-edit or approve classifications

**Re-classification**:
```typescript
// Update company description, then re-classify
await supabase.from('companies').update({
  id: companyId,
  description: newDescription,
  classification_status: 'pending'
})

// Trigger re-classification
await supabase.functions.invoke('classify-company', {
  body: { companyId, companyName, website, business_description: newDescription }
})
```

### Updating Framework Scores

**Single Score Update**:
```typescript
const { error } = await supabase
  .from('detailed_scores')
  .upsert({
    theme_id: themeId,
    criteria_id: criteriaId,
    score: 5, // 1, 3, or 5
    confidence: 'High',
    notes: 'Market size estimated at $10B with 15% CAGR',
    updated_by: userId,
    update_source: 'manual'
  }, {
    onConflict: 'theme_id,criteria_id'
  })
```

**Bulk Score Update** (entire theme):
```typescript
await supabase.functions.invoke('bulk-score-update', {
  body: {
    theme_id: themeId,
    scores: [
      { criteria_id: 'A1-id', score: 5, confidence: 'High', notes: '...' },
      { criteria_id: 'A2-id', score: 3, confidence: 'Medium', notes: '...' },
      { criteria_id: 'B1-id', score: 5, confidence: 'High', notes: '...' },
      // ... all criteria
    ]
  }
})
```

### Adding a New Scraping Source

**Via UI** (`/source-monitors`):
1. Click "Add Source"
2. Fill in `AddSourceDialog`:
   - Source name (e.g., "Carbon Brief News")
   - Source type (RSS/HTML CSS/HTML AI/API)
   - Base URL
   - Feed URL (for RSS) OR scraping config (for HTML)
   - Check frequency (hourly/daily/weekly)
3. Save → creates record in `sources` table
4. n8n workflow picks it up on next run

**Scraping Config Examples**:

**RSS Feed**:
```json
{
  "source_type": "rss",
  "feed_url": "https://www.carbonbrief.org/feed/",
  "field_mappings": {
    "title": "{{$json.title}}",
    "description": "{{$json.contentSnippet}}",
    "url": "{{$json.link}}",
    "publication_date": "{{$json.pubDate}}"
  }
}
```

**HTML with CSS Selectors**:
```json
{
  "source_type": "html_css",
  "base_url": "https://www.iea.org/news",
  "scraping_config": {
    "list_selector": ".news-item",
    "field_selectors": {
      "title": "h3.title",
      "description": "p.summary",
      "url": "a.read-more::attr(href)",
      "date": "span.date"
    }
  }
}
```

**HTML with AI Extraction**:
```json
{
  "source_type": "html_ai",
  "base_url": "https://www.example.com/deals",
  "scraping_config": {
    "extraction_type": "ai",
    "extraction_prompt": "Extract all funding announcements from this page. For each, extract company name, amount raised, investors, date, and brief description.",
    "extraction_schema": {
      "type": "object",
      "properties": {
        "deals": {
          "type": "array",
          "items": {
            "company_name": { "type": "string" },
            "amount": { "type": "string" },
            "investors": { "type": "array" },
            "date": { "type": "string" },
            "description": { "type": "string" }
          }
        }
      }
    }
  }
}
```

### Creating Intelligence Memos

**Process** (manual for now, can be automated):
1. Filter processed signals by date range and `is_featured = true`
2. Group by `signal_type_classified` (deals, regulatory, news)
3. For each group, generate AI summary:
   ```typescript
   const summary = await generateAISummary({
     signals: dealSignals,
     prompt: `Summarize these ${dealSignals.length} investment deals from the past week. Highlight key trends, largest deals, and emerging sectors. Format as a concise paragraph for executive readership.`
   })
   ```
4. Create memo record:
   ```typescript
   await supabase.from('intelligence_memos').insert({
     week_start_date: '2025-01-20',
     week_end_date: '2025-01-26',
     deals_section: dealsSummary,
     regulatory_section: regulatorySummary,
     market_news_section: newsSummary,
     signal_count: totalSignals,
     status: 'draft'
   })
   ```
5. Review in `IntelligenceMemoModal`
6. Publish → sets `status = 'published'` and `published_at`

### Linking Regulations to Themes

1. Create regulation in `RegulatoryTracker` page
2. Click "Link to Themes" → opens `RegulationThemeLinkModal`
3. Select affected themes
4. For each theme, specify:
   - Relevance score (0-100)
   - Impact description (how regulation affects theme)
   - Criteria impacts (which framework criteria affected, e.g., ["D1", "D2"] for regulatory risk)
5. Save → creates records in `theme_regulations`
6. Regulations now appear on theme profile pages

---

## Technical Decisions & Rationale

### Why Two Scoring Systems?

**Old System** (`scores` + `attributes` tables):
- **Purpose**: Simple weighted scoring (6 attributes)
- **Status**: DEPRECATED, exists for backward compatibility
- **Location**: `src/types/themes.ts`, referenced in some older components

**New System** (`framework_categories` + `framework_criteria` + `detailed_scores`):
- **Purpose**: Detailed evaluation framework (5 categories, 20+ criteria)
- **Status**: ACTIVE, used for all new development
- **Location**: `src/types/framework.ts`, primary scoring interface

**Migration Strategy**:
- New themes use framework scoring only
- Old theme scores can be migrated via admin tool (future)
- UI displays framework scores by default, falls back to old system if no framework scores exist

### Why Business Models Are Independent (Not Theme-Specific)

**Original Design** (deprecated): `theme_business_models` table linked specific business models to themes

**Problem**: Business models are company attributes, not theme attributes
- Example: A SaaS company can be classified into "EV Charging Software" theme, but SaaS is the business model, not a theme property
- Confusing to classify: "Is SaaS relevant to this theme?" vs. "Does this company use a SaaS model?"

**New Design**: `taxonomy_business_models` + `company_business_models`
- Business models are independent tags
- Companies can have multiple business models (e.g., Hardware + SaaS)
- Themes don't "have" business models, companies do

### Why Separate `raw_signals` and `processed_signals`?

**Separation of Concerns**:
1. **Raw Signals**: Immutable scraped data
   - Preserves original content for auditing
   - Can be re-processed with updated AI prompts
   - Enables data quality analysis

2. **Processed Signals**: Enriched, classified data
   - AI-extracted structured data (signal type, countries, deal size)
   - Human-curated flags (`is_featured`, `memo_section`)
   - Linked to themes via `theme_signals`

**Enables Re-processing**:
```sql
-- Re-classify all signals from a source with updated AI prompt
UPDATE processed_signals
SET signal_type_classified = NULL, countries = NULL
WHERE raw_signal_id IN (
  SELECT id FROM raw_signals WHERE source = 'Carbon Brief'
);

-- Then re-run classification edge function
```

### Why Use Edge Functions Instead of Client-Side AI Calls?

**Security**:
- API keys never exposed to client
- Rate limiting enforced on server
- Consistent error handling

**Performance**:
- Parallel processing for batch operations
- Caching of taxonomy data
- No CORS issues

**Cost Control**:
- Track AI API usage per function
- Implement quotas and alerts
- Optimize prompts centrally

### Why PostgreSQL Triggers Instead of Application Logic?

**DealCloud Sync Trigger**:
- **Reliability**: Guaranteed to fire on every insert/update, even from SQL scripts or n8n
- **Decoupling**: Classification logic doesn't need to know about DealCloud
- **Audit Trail**: Centralized logging in `dealcloud_sync_log`

**Auto-Created Scores**:
- When new theme created, automatically creates `detailed_scores` rows for all criteria
- Ensures consistent structure (no missing score entries)
- Analysts can immediately start scoring without setup

### Why Fingerprinting Instead of URL-Based Deduplication?

**Problem with URLs**:
- Same article published on multiple URLs (canonical + AMP + syndication)
- URL parameters can change (tracking codes, session IDs)
- Redirects and URL shorteners

**Fingerprinting Solution**:
- MD5 hash of `title + content` (normalized)
- Detects duplicate content regardless of URL
- Also check `signal_id` (source-specific ID) as secondary
- Both fields indexed for performance

---

## Troubleshooting Guide

### Issue: Companies Not Syncing to DealCloud

**Checklist**:
1. Does company have `dealcloud_id`? Check `companies.dealcloud_id IS NOT NULL`
2. Is `needs_dealcloud_sync` flag set? Check `companies.needs_dealcloud_sync = true`
3. Check `dealcloud_sync_log` for error messages
4. Verify theme has entry in `dealcloud_theme_mapping`
5. Test n8n webhook manually: `POST https://towerbrook.app.n8n.cloud/webhook/dealcloud-sync`
6. Check DealCloud API credentials in n8n

**Common Errors**:
- **"Theme not found in mapping"**: Add theme to `dealcloud_theme_mapping` table
- **"401 Unauthorized"**: DealCloud API token expired, refresh in n8n
- **"404 Not Found"**: `dealcloud_id` doesn't exist in DealCloud, verify ID

### Issue: Duplicate Signals in Database

**Diagnosis**:
```sql
-- Find duplicate signals by fingerprint
SELECT fingerprint, COUNT(*) as count
FROM raw_signals
GROUP BY fingerprint
HAVING COUNT(*) > 1;

-- Find duplicate signals by signal_id
SELECT signal_id, COUNT(*) as count
FROM raw_signals
GROUP BY signal_id
HAVING COUNT(*) > 1;
```

**Causes**:
1. **n8n not checking before insert**: Verify deduplication step in workflow
2. **Race condition**: Multiple scraper runs at same time
3. **Fingerprint collision**: Rare, but possible with very short content

**Fix**:
```sql
-- Delete duplicates, keeping oldest
DELETE FROM raw_signals a
USING raw_signals b
WHERE a.id > b.id
  AND a.fingerprint = b.fingerprint;

-- Add unique constraint (if not exists)
ALTER TABLE raw_signals
ADD CONSTRAINT unique_fingerprint UNIQUE (fingerprint);
```

### Issue: Framework Scores Not Calculating

**Checklist**:
1. Are all categories A-D present in `framework_categories`?
2. Do all categories have criteria in `framework_criteria`?
3. Does theme have scores in `detailed_scores`?
4. Are scores NULL or actual values (1/3/5)?

**Debug Query**:
```sql
-- Check scoring data for a theme
SELECT 
  fc.code as category_code,
  fcr.code as criteria_code,
  ds.score,
  ds.confidence
FROM framework_categories fc
JOIN framework_criteria fcr ON fcr.category_id = fc.id
LEFT JOIN detailed_scores ds ON ds.criteria_id = fcr.id AND ds.theme_id = 'THEME_ID_HERE'
WHERE fc.code IN ('A', 'B', 'C', 'D')
ORDER BY fc.display_order, fcr.display_order;
```

**Common Issues**:
- **NULL scores**: Not an error, indicates "Not Yet Scored"
- **Category E included**: Verify frontend filters to A-D only
- **Missing criteria**: Run migration to add new criteria to existing themes

### Issue: AI Classification Returning Empty Results

**Checklist**:
1. Is `LOVABLE_API_KEY` set in Supabase secrets?
2. Check edge function logs: `https://supabase.com/dashboard/project/blwwpvvdnpkipjgajwiw/functions/classify-company/logs`
3. Verify AI response is valid JSON
4. Check company description is not empty

**Debug Edge Function**:
```typescript
// Add logging to classify-company function
console.log('Taxonomy:', JSON.stringify(taxonomy, null, 2))
console.log('AI Response:', aiResponse)
console.log('Parsed Result:', JSON.parse(aiResponse.choices[0].message.content))
```

**Common Errors**:
- **"Invalid JSON response"**: AI returned malformed JSON, improve prompt
- **"No themes matched"**: Company description too vague, add more details
- **"Rate limit exceeded"**: Lovable API quota reached, wait or upgrade plan

### Issue: Scraper Not Picking Up New Sources

**Checklist**:
1. Is source `status = 'active'`? Check `sources.status`
2. Is `check_frequency` set? Should be 'hourly', 'daily', or 'weekly'
3. Check n8n workflow is running (not paused)
4. Verify `last_checked_at` is updating

**n8n Debugging**:
1. Open n8n workflow: `https://towerbrook.app.n8n.cloud/workflow/universal-scraper`
2. Click "Execute Workflow" manually
3. Check execution logs for errors
4. Test individual nodes (right-click → "Execute Node")

**Common Issues**:
- **"No data returned"**: CSS selectors or AI prompt incorrect, test on source URL
- **"Timeout error"**: Source website slow or blocking bots, increase timeout
- **"SSL certificate error"**: Use `curl` to test URL, may need to disable SSL verification

### Issue: Research Documents Not Displaying

**Checklist**:
1. Is file uploaded to `research-documents` bucket? Check Supabase Storage
2. Is bucket public? Should be for viewing PDFs
3. Does record exist in `research_documents` table?
4. Is `file_path` correct? Format: `{theme_id}/{filename}.pdf`

**RLS Policy Check**:
```sql
-- Verify storage policies
SELECT * FROM storage.policies 
WHERE bucket_id = 'research-documents';

-- Should have policy for public read access
-- Example:
-- CREATE POLICY "Public read access" ON storage.objects
-- FOR SELECT USING (bucket_id = 'research-documents');
```

**Storage Debug**:
```typescript
// Test file access
const { data, error } = await supabase.storage
  .from('research-documents')
  .getPublicUrl('theme-id/document.pdf')

console.log('Public URL:', data.publicUrl)
// Should return URL like: https://blwwpvvdnpkipjgajwiw.supabase.co/storage/v1/object/public/research-documents/...
```

### Performance Optimization Tips

**Database Indexes** (already created):
- `raw_signals.signal_id` (unique)
- `raw_signals.fingerprint` (unique)
- `raw_signals.source_id`
- `processed_signals.raw_signal_id`
- `company_theme_mappings.company_id`
- `company_theme_mappings.theme_id`
- `detailed_scores (theme_id, criteria_id)` (composite unique)

**Query Optimization**:
```typescript
// BAD: N+1 query problem
const themes = await fetchThemes()
for (const theme of themes) {
  const scores = await fetchScores(theme.id)  // Multiple queries!
}

// GOOD: Single query with join
const { data } = await supabase
  .from('taxonomy_themes')
  .select(`
    *,
    detailed_scores(*, framework_criteria(*))
  `)
```

**React Query Caching**:
```typescript
// Set staleTime to reduce refetches
useQuery({
  queryKey: ['themes'],
  queryFn: fetchThemes,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
})
```

**Edge Function Optimization**:
```typescript
// Cache taxonomy data (changes infrequently)
let cachedTaxonomy: any = null
let cacheTimestamp = 0
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

const getTaxonomy = async () => {
  const now = Date.now()
  if (cachedTaxonomy && (now - cacheTimestamp < CACHE_TTL)) {
    return cachedTaxonomy
  }
  
  const { data } = await supabase.rpc('get_taxonomy_json')
  cachedTaxonomy = data
  cacheTimestamp = now
  return data
}
```

---

## Quick Reference: Key IDs and Constants

**Supabase Project**:
- Project ID: `blwwpvvdnpkipjgajwiw`
- URL: `https://blwwpvvdnpkipjgajwiw.supabase.co`

**DealCloud**:
- Investment Themes Object ID: `94467`

**Enum Values**:
- User Roles: `admin`, `analyst`
- Classification Status: `pending`, `in_progress`, `completed`, `failed`
- Source Types: `rss`, `html_css`, `html_ai`, `api`
- Source Status: `active`, `paused`, `error`
- Signal Types: `deal`, `regulatory`, `market_news`, `research`
- Update Source: `manual`, `llm_research`, `market_signal`
- Confidence Levels: `High`, `Medium`, `Low`
- Impact Levels: `high`, `medium`, `low`
- Regulation Status: `active`, `proposed`, `expired`
- Memo Status: `draft`, `published`
- Check Frequency: `hourly`, `daily`, `weekly`

**Score Values**: `1` (Low), `3` (Medium), `5` (High) - **Only these values allowed**

**Framework Categories** (codes): `A`, `B`, `C`, `D`, `E`
- A-D used for scoring
- E excluded from overall score calculation

---

## End of Context Document

**Last Updated**: 2025-01-28

**Version**: 1.0

**Maintained By**: Delta Metis AI Team

**Usage**: Upload to Lovable project's Custom Knowledge after transfer to preserve context.
