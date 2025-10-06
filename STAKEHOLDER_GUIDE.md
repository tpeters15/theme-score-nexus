# Stakeholder Guide
## Understanding the Sustainability Intelligence Platform

**Audience:** Non-technical stakeholders, executives, portfolio managers, external partners

---

## 🎯 What This Platform Is

Think of this platform as your **automated research assistant** for sustainability and climate investing. Instead of analysts manually reading hundreds of articles per week, the system:

1. **Automatically collects** news, reports, and regulatory updates from 50+ sources
2. **Intelligently organizes** this information by sustainability themes
3. **Assesses companies** against detailed scoring frameworks
4. **Surfaces insights** that matter for investment decisions

**In simple terms:** It's like having a tireless analyst who reads everything, organizes it perfectly, and highlights what you need to know.

---

## 🗺️ How to Navigate the Platform

### Main Sections

#### 1. **Dashboard (Home)**
**What you see:** High-level overview of recent activity
- Recent signals processed this week
- Top themes trending in the market
- Portfolio metrics and alerts
- Quick links to key workflows

**How to read it:** 
- Green metrics = positive trends
- Red alerts = regulatory risks or high-priority signals
- Numbers show weekly changes

---

#### 2. **Themes**
**What it is:** The "taxonomy" - a structured catalog of 50+ sustainability investment themes

**Structure:**
```
Pillar (e.g., "Energy Transition")
  └── Sector (e.g., "Clean Energy Generation")
      └── Theme (e.g., "Solar PV Manufacturing")
```

**How to use it:**
1. Browse by pillar to explore broad categories
2. Drill down to specific themes for details
3. Click any theme to see:
   - What's in scope / out of scope
   - Example companies
   - Related business models
   - Recent signals mentioning this theme
   - Linked regulations

**Pro tip:** Use the search bar to find themes by keyword (e.g., "battery", "carbon capture", "EV")

---

#### 3. **Signals**
**What it is:** News, reports, and market intelligence automatically collected and classified

**Types of signals:**
- **Deal announcements** (M&A, funding rounds)
- **Regulatory updates** (new policies, deadlines)
- **Market news** (product launches, partnerships)
- **Research reports** (industry analysis, whitepapers)

**How to read the table:**
- **Title:** Headline of the article/report
- **Source:** Where it came from (e.g., Bloomberg, IEA, Carbon Brief)
- **Type:** Deal / Regulatory / Market News
- **Date:** When it was published
- **Themes:** Auto-tagged sustainability themes
- **Priority:** 0-10 scale (higher = more important for your portfolio)

**Filters:**
- By date range (this week, last month, etc.)
- By signal type (deals only, regulatory only, etc.)
- By theme (show me all "Green Hydrogen" signals)
- By source (show me all IEA reports)

---

#### 4. **Company Classifier**
**What it is:** Batch analysis tool to assess companies against your theme taxonomy

**How it works:**
1. Upload a CSV file with company names and websites
2. AI analyzes each company's public information
3. Get back theme classifications with confidence scores

**Example output:**
```
Company: Nextracker Inc.
Primary Theme: Solar PV Tracking Systems
Confidence: 95%
Rationale: "Nextracker designs and manufactures solar tracker systems..."
```

**Use cases:**
- Screen new investment opportunities
- Tag existing portfolio companies by theme
- Validate theme exposure across holdings
- Research potential targets in a specific theme

---

#### 5. **Research Library**
**What it is:** Repository of documents and research organized by theme and scoring criteria

**How to use it:**
1. Navigate to a specific theme (e.g., "Battery Energy Storage")
2. View all supporting documents:
   - Market research reports
   - Technology whitepapers
   - Regulatory impact analyses
   - Competitor analyses
3. Download documents for offline review
4. See which documents support which scoring criteria

**Pro tip:** Documents are tagged by the criteria they help assess, so you can trace scoring back to evidence.

---

#### 6. **Regulatory Tracker**
**What it is:** Database of regulations and policies relevant to your investment themes

**Key features:**
- **Filter by jurisdiction** (US, EU, China, etc.)
- **See impact level** (High/Medium/Low)
- **Track compliance deadlines**
- **Link to affected themes** (which themes are impacted by this regulation?)

**Example:**
```
Regulation: EU Corporate Sustainability Reporting Directive (CSRD)
Jurisdiction: European Union
Status: Active
Effective Date: 2024-01-01
Impact Level: High
Affected Themes: 
  - ESG Reporting Software (relevance: 95%)
  - Carbon Accounting (relevance: 85%)
  - Supply Chain Traceability (relevance: 70%)
```

**How to use it:**
1. Review upcoming compliance deadlines
2. Identify portfolio companies affected by new regulations
3. Spot investment opportunities (regulation often drives demand)
4. Stay ahead of policy changes

---

#### 7. **Framework Scoring**
**What it is:** Multi-criteria assessment system for evaluating companies in depth

**Structure:**
```
Category (e.g., "Market Opportunity")
  └── Criteria (e.g., "Total Addressable Market Size")
      └── Score: 0-100
      └── Confidence: High/Medium/Low
      └── Notes: "TAM estimated at $50B by 2030 (Source: IEA)"
```

**How scoring works:**
- Each theme has a customized framework
- Analysts (or AI) score companies across 10-20 criteria
- Scores are weighted by category importance
- Final score = weighted average (0-100)

**Reading a scorecard:**
- **80-100:** Excellent fit for theme, strong investment case
- **60-79:** Good fit, some gaps or risks
- **40-59:** Moderate fit, significant questions
- **0-39:** Weak fit, likely out of scope

**Color coding:**
- 🟢 Green: High confidence
- 🟡 Yellow: Medium confidence (needs more research)
- 🔴 Red: Low confidence (early-stage or data gaps)

---

## 📊 Understanding Key Metrics

### Signal Processing Metrics
- **Signals Scraped:** Raw articles/reports collected this week
- **Signals Processed:** Signals that have been classified and tagged
- **Processing Rate:** % of signals successfully processed
- **Average Age:** Days between publication and processing

**What's good:**
- High processing rate (>90%)
- Low average age (<7 days) = timely intelligence

---

### Theme Coverage Metrics
- **Active Themes:** Themes with recent signal activity
- **Signal Density:** Avg signals per theme per week
- **Theme Momentum:** Themes with increasing signal volume

**What's good:**
- High signal density = well-covered theme with rich data
- Rising momentum = emerging trend worth investigating

---

### Classification Metrics
- **Batch Size:** Companies classified in a given batch
- **Success Rate:** % of companies successfully classified
- **High Confidence Rate:** % with >80% confidence

**What's good:**
- High success rate (>95%)
- High confidence rate (>70%) = clear theme fit or non-fit

---

## 🔍 Common Questions

### Q: How often is data updated?
**A:** Real-time for scraped sources. The system checks sources every 1-24 hours depending on source type and activity level.

### Q: How accurate is the AI classification?
**A:** 85-95% accuracy based on manual spot-checks. High-stakes decisions should always be human-reviewed.

### Q: Can I add my own data sources?
**A:** Yes, admins can add new RSS feeds or HTML sources via the Source Monitors page.

### Q: How far back does historical data go?
**A:** Depends on when the source was added. Some sources have data back to 2023, newer sources start from their activation date.

### Q: What happens to duplicate signals?
**A:** The system automatically detects duplicates using content fingerprinting and marks them as such (not double-counted).

### Q: Can I export data?
**A:** Yes, most tables have CSV export functionality. For custom reports, contact the research team.

### Q: How do I request a new theme?
**A:** Submit a request to the admin team via the Taxonomy Management page. Include theme name, definition, and example companies.

### Q: What if a company doesn't match any theme?
**A:** This is expected for ~20% of companies. They may be too diversified, too early-stage, or outside the sustainability scope.

---

## 🚦 How to Read Alerts

### Priority Levels

**🔴 High Priority (8-10)**
- Large deals (>$100M) in core themes
- Major regulatory changes with immediate impact
- Significant technology breakthroughs
- Public company announcements (material events)

**🟡 Medium Priority (5-7)**
- Mid-sized deals ($10M-$100M)
- Regulatory proposals (not yet final)
- Industry partnerships
- Market research reports

**🟢 Low Priority (0-4)**
- Small deals (<$10M)
- General industry news
- Academic research (early-stage)
- International coverage (non-primary markets)

---

## 📅 Typical Workflows

### Weekly Intelligence Review
1. Log in Monday morning
2. Review Dashboard for weekend signals
3. Check Regulatory Tracker for new updates
4. Browse top 5 trending themes
5. Read high-priority signals in detail
6. Flag key signals for weekly memo

**Time required:** 30-60 minutes

---

### New Company Research
1. Go to Classifier page
2. Enter company name and website
3. Review classification results
4. If good fit: Navigate to theme page
5. Review scoring framework for that theme
6. Use Research Library to gather supporting docs
7. Manually score company (or trigger AI scoring)

**Time required:** 15-30 minutes per company

---

### Regulatory Impact Assessment
1. Go to Regulatory Tracker
2. Filter by recent updates (last 30 days)
3. Click on relevant regulation
4. Review linked themes (sorted by relevance)
5. Cross-reference with portfolio holdings
6. Document exposure and required actions

**Time required:** 1-2 hours per major regulation

---

## 🤝 Getting Help

### For Technical Issues
- Contact: Platform Admin Team
- Scope: Login issues, bugs, data quality problems, performance issues

### For Content Questions
- Contact: Research Team
- Scope: Theme definitions, classification questions, framework scoring, data interpretation

### For Feature Requests
- Submit via: Feedback form (coming soon)
- Or email: Product team

---

## 📚 Glossary of Terms

See **PROJECT_GLOSSARY.md** for a complete technical-to-business translation guide.

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Questions?** Contact the Research Team
