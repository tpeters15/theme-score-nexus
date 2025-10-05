# Universal Scraper System Architecture

## Overview

A configuration-driven scraping system that handles RSS feeds, HTML parsing, and AI-powered extraction through a **single universal n8n workflow**.

## System Components

### 1. **Database Layer** (Supabase)

- **`scraper_sources`**: Source configurations
- **`scraper_runs`**: Execution monitoring
- **`scraper_content_cache`**: Debug cache (auto-expires after 7 days)
- **`signals`**: Your existing signals table

### 2. **Processing Layer** (n8n Workflow)

One workflow handles all source types:

```
┌──────────────────┐
│  Schedule Trigger │  ← Runs every 30 minutes
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Get Sources to  │  ← SQL: WHERE is_active AND should_run_now
│  Scrape (DB)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Loop Over       │  ← Process each source
│  Sources         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Create Run      │  ← Insert to scraper_runs (status: running)
│  Record          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Route by Type   │  ← IF node: source_type
└────────┬─────────┘
         │
    ┌────┼────┬──────┐
    │    │    │      │
    ▼    ▼    ▼      ▼
  ┌──┐ ┌───┐ ┌───┐ ┌───┐
  │RSS│ │CSS│ │AI │ │API│
  └┬─┘ └─┬─┘ └─┬─┘ └─┬─┘
   │     │     │     │
   └──┬──┴──┬──┴─────┘
      │     │
      ▼     ▼
┌──────────────────┐
│  Transform to    │  ← Normalize all to signal schema
│  Signal Schema   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Deduplicate     │  ← Check existing signals by URL hash
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Batch Insert    │  ← Insert new signals to Supabase
│  Signals         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Update Run      │  ← Mark completed, update stats
│  Stats           │
└──────────────────┘
```

### 3. **Frontend Layer** (React)

**New Page**: `/scraper-sources`

Features:
- View all scraper sources
- Add/edit source configurations
- Manual trigger button
- Real-time run monitoring
- Signal preview

## Source Type Details

### Type 1: RSS Feeds

**Config Example:**
```json
{
  "name": "Bloomberg Green RSS",
  "source_type": "rss",
  "url": "https://www.bloomberg.com/green/rss",
  "schedule_cron": "0 */2 * * *",
  "config": {
    "author_field": "author",
    "category_mapping": {
      "energy": "Energy",
      "policy": "Policy"
    }
  }
}
```

**n8n Processing:**
1. HTTP Request → Fetch RSS XML
2. XML Parser → Convert to JSON
3. Map items → Transform to signal schema

**Pros:**
- Zero configuration needed
- Fast and reliable
- Works for ~70% of sources

### Type 2: HTML Simple (CSS Selectors)

**Config Example:**
```json
{
  "name": "IEA News Page",
  "source_type": "html_simple",
  "url": "https://www.iea.org/news",
  "schedule_cron": "0 8 * * *",
  "config": {
    "list_selector": ".m-article-list__item",
    "item_selectors": {
      "title": ".m-article-list__title",
      "url": ".m-article-list__link@href",
      "date": ".m-article-list__date",
      "description": ".m-article-list__excerpt"
    }
  }
}
```

**n8n Processing:**
1. HTTP Request → Fetch HTML
2. HTML Extract node → Apply CSS selectors
3. Map items → Transform to signal schema

**Pros:**
- Still fast and cheap
- Works for structured HTML pages
- Good for ~20% of sources

**When to Use:**
- Page has consistent HTML structure
- No JavaScript rendering required
- List-based content

### Type 3: HTML AI-Powered

**Config Example:**
```json
{
  "name": "Carbon Brief Daily - News",
  "source_type": "html_ai",
  "url": "https://www.carbonbrief.org/daily-brief/",
  "schedule_cron": "0 9 * * *",
  "extraction_prompt": "Extract news signals from the NEWS section...",
  "expected_schema": {...},
  "config": {
    "use_firecrawl": true,
    "firecrawl_options": {
      "onlyMainContent": true,
      "formats": ["markdown", "html"]
    }
  }
}
```

**n8n Processing:**
1. Firecrawl API → Get clean markdown
2. Claude Sonnet 4 → Extract structured data using prompt
3. Validate against schema
4. Transform to signal schema

**Pros:**
- Handles complex, nested structures
- Works with inconsistent formats
- Adapts to minor page changes

**Cons:**
- ~$0.02 per page (Firecrawl + Claude)
- Slower (~5-10 seconds per page)

**When to Use:**
- Complex nested structures (like Carbon Brief)
- No consistent CSS classes
- Multiple content formats per page
- Newsletter-style content

## Cost Analysis

### Monthly Costs (Based on 11 sources)

| Source Type | Count | Runs/Day | API Costs | Total/Month |
|-------------|-------|----------|-----------|-------------|
| RSS         | 8     | 12       | $0        | $0          |
| HTML Simple | 3     | 1        | $0        | $0          |
| HTML AI     | 3     | 1        | $0.06/run | $5.40       |

**Total: ~$5.40/month** (vs current manual effort)

### With Firecrawl API:
- 3 AI sources × 30 days = 90 scrapes/month
- Firecrawl: $0.015/scrape = $1.35
- Claude: $0.045/scrape (15K tokens @ $3/M) = $4.05
- **Total: $5.40/month**

## Adding a New Source

### Option A: Via UI (Recommended)

1. Go to `/scraper-sources`
2. Click "Add Source"
3. Fill in form:
   - Name: "Source Name"
   - Type: Select from dropdown
   - URL: "https://..."
   - Schedule: Select cron preset
4. For **HTML AI** type:
   - Click "Generate Prompt" → AI creates extraction prompt
   - Review and edit if needed
   - Click "Test Extraction" → Preview results
5. Click "Save & Activate"

**Time: 2-3 minutes**

### Option B: Direct SQL Insert

```sql
INSERT INTO scraper_sources (name, source_type, url, extraction_prompt, config) VALUES
('New Source', 'html_ai', 'https://example.com/news',
 'Extract articles with title, summary, url...',
 '{"use_firecrawl": true}'::jsonb
);
```

**Time: 1 minute**

## Monitoring & Debugging

### Dashboard Queries

**Recent Scraper Activity:**
```sql
SELECT
  s.name,
  r.status,
  r.signals_new,
  r.signals_duplicate,
  r.execution_time_seconds,
  r.created_at
FROM scraper_runs r
JOIN scraper_sources s ON s.id = r.source_id
ORDER BY r.created_at DESC
LIMIT 20;
```

**Source Health:**
```sql
SELECT
  name,
  last_scraped_at,
  last_success_at,
  total_signals_collected,
  last_error
FROM scraper_sources
WHERE is_active = true
ORDER BY last_scraped_at DESC;
```

### Debugging Failed Runs

1. Check `scraper_runs.error_message`
2. View cached content: `SELECT raw_html FROM scraper_content_cache WHERE source_id = ?`
3. Test extraction in n8n with pinned data
4. Adjust prompt or selectors in `scraper_sources` table

## Best Practices

### 1. Start Simple, Add AI When Needed

```
Try RSS → Try HTML Simple → Use AI as last resort
```

### 2. Prompt Engineering for AI Sources

**Good Prompt:**
```
Extract news signals from the NEWS section.

For each story:
- title: Main headline (string)
- source: Publication name (string)
- source_url: Original article URL (url)
- summary: 2-3 sentences (string)

IGNORE:
- Navigation menus
- "Read more" links without context
- Advertisements

Return JSON array only.
```

**Bad Prompt:**
```
Get all the news from the page
```

### 3. Deduplication Strategy

Use **content hash** instead of just URL:

```javascript
const contentHash = crypto
  .createHash('md5')
  .update(title + source + summary)
  .digest('hex');
```

This catches:
- Same article with different URLs
- Republished content
- Duplicate signals from multiple sources

### 4. Graceful Degradation

If AI extraction fails:
1. Log error with raw HTML cached
2. Send Slack notification
3. Don't block other sources
4. Retry with simpler prompt

## Migration Plan

### Phase 1: Setup (Week 1)
- [x] Create database migration
- [ ] Deploy Supabase migration
- [ ] Build universal n8n workflow
- [ ] Test with 1 RSS source

### Phase 2: Migrate Existing (Week 2)
- [ ] Migrate 8 RSS feeds → DB configs
- [ ] Migrate 3 HTML scrapers → DB configs
- [ ] Deactivate old n8n workflows
- [ ] Monitor for 7 days

### Phase 3: Add Carbon Brief (Week 3)
- [ ] Create AI extraction prompt
- [ ] Test with single section
- [ ] Expand to all sections
- [ ] Monitor accuracy

### Phase 4: Scale (Week 4)
- [ ] Build frontend UI for source management
- [ ] Add 5 more sources
- [ ] Set up monitoring dashboard
- [ ] Create Slack alerts

## Technical Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Orchestration | n8n | Existing infrastructure |
| Content Extraction | Firecrawl API | Clean markdown, handles JS |
| AI Extraction | Claude Sonnet 4 | Best at instruction-following |
| Storage | Supabase | Existing database |
| Caching | Supabase table | Simple, SQL-queryable |
| Monitoring | Supabase queries | Real-time, no new tools |

## Alternative Approaches Considered

### ❌ Apify Actors
**Pros:** Visual scraper builder
**Cons:** $50/month, still manual config, vendor lock-in

### ❌ Scrapy + Python
**Pros:** Powerful, flexible
**Cons:** Requires separate infrastructure, steeper learning curve

### ❌ Puppeteer/Playwright
**Pros:** Full browser control
**Cons:** Resource-heavy, slow, expensive to run

### ✅ Firecrawl + Claude (Chosen)
**Pros:** Fast setup, handles edge cases, scales well
**Cons:** API costs (~$5/month for 100 pages)

## Next Steps

1. **Deploy migration**: `supabase db push`
2. **Create n8n workflow**: Import JSON (I'll create this next)
3. **Test with Bloomberg RSS**: Verify end-to-end
4. **Build frontend UI**: Source management page
5. **Migrate Carbon Brief**: First AI-powered source

Would you like me to:
1. Create the complete n8n workflow JSON?
2. Build the React frontend for source management?
3. Create the Firecrawl + Claude extraction function?
