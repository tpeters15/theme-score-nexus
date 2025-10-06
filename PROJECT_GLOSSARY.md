# Project Glossary
## Technical Terms Translated for Business Stakeholders

**Purpose:** Bridge the gap between technical implementation and business understanding

---

## 🎯 Core Concepts

### Signal
**Technical:** A row in the `raw_signals` or `processed_signals` table  
**Business:** A piece of market intelligence (article, report, announcement) that the system has collected  
**Example:** "We processed 500 signals this week" = "We analyzed 500 news articles and reports this week"

### Theme
**Technical:** A row in the `taxonomy_themes` table linked to sectors and pillars  
**Business:** An investment category or sustainability topic we track (e.g., "Solar PV Manufacturing", "Green Hydrogen")  
**Example:** "This company matches 3 themes" = "This company operates in 3 of our investment focus areas"

### Classification
**Technical:** Running a company description through an AI model to output theme probabilities  
**Business:** Automatically figuring out which sustainability themes a company is involved in  
**Example:** "The classifier returned 85% confidence" = "The AI is 85% sure this company fits this theme"

### Framework
**Technical:** A collection of `framework_categories` and `framework_criteria` with weights  
**Business:** A scorecard or checklist for evaluating companies against specific standards  
**Example:** "The framework has 5 categories" = "The scorecard evaluates companies on 5 different aspects"

### Scraper
**Technical:** An automated script that fetches HTML/RSS content and parses structured data  
**Business:** A robot that reads websites and extracts relevant information automatically  
**Example:** "The scraper runs daily" = "The system checks this website every day for new content"

### RLS (Row-Level Security)
**Technical:** PostgreSQL policies that filter database queries based on user identity  
**Business:** Security rules that ensure users only see data they're allowed to see  
**Example:** "RLS prevents users from seeing each other's batches" = "Your data is private from other users"

### Edge Function
**Technical:** A serverless function deployed to Supabase that runs on-demand  
**Business:** A small piece of code that runs in the cloud when needed (like when you upload a file)  
**Example:** "The edge function processes the webhook" = "Cloud code handles incoming data from external systems"

---

## 📊 Data & Analytics Terms

### Taxonomy
**Technical:** A hierarchical data structure with 3 levels (pillars → sectors → themes)  
**Business:** An organized catalog of investment themes, like folders and subfolders  
**Example:** "We have 50+ themes in our taxonomy" = "Our catalog has 50+ specific investment categories"

### Pillar
**Technical:** Top-level category in the taxonomy hierarchy  
**Business:** Major sustainability domain (e.g., "Energy Transition", "Circular Economy", "Sustainable Food")  
**Example:** "All themes roll up to 5 pillars" = "All our categories fall under 5 main focus areas"

### Sector
**Technical:** Mid-level category between pillar and theme  
**Business:** Subcategory within a pillar (e.g., "Clean Energy Generation" under "Energy Transition")  
**Example:** "Each pillar contains 3-7 sectors" = "Each major area breaks down into 3-7 sub-areas"

### Business Model
**Technical:** A row in `taxonomy_business_models` linked via `taxonomy_theme_business_models`  
**Business:** How a company makes money in a given theme (e.g., "SaaS", "Hardware", "Project Developer")  
**Example:** "This theme has 4 business models" = "Companies in this theme make money in 4 different ways"

### Confidence Score
**Technical:** A float between 0.0 and 1.0 (or percentage) output by the AI classification model  
**Business:** How certain the AI is about its answer (higher = more sure)  
**Example:** "95% confidence" = "The AI is very sure about this classification"

### Priority Score
**Technical:** An integer 0-10 assigned to signals based on deal size, source credibility, and theme relevance  
**Business:** How important this signal is for investment decisions (10 = must read, 0 = low importance)  
**Example:** "Priority 9 signals" = "The most important news items this week"

### Fingerprint
**Technical:** A hash of the signal content used for deduplication  
**Business:** A unique ID that helps us detect duplicate articles  
**Example:** "Same fingerprint = duplicate" = "If two articles have the same fingerprint, they're the same content"

---

## 🧠 AI & Automation Terms

### LLM (Large Language Model)
**Technical:** GPT-4 or similar transformer model accessed via API  
**Business:** Advanced AI that can read, understand, and generate text (like ChatGPT)  
**Example:** "We use an LLM for classification" = "We use AI to automatically categorize companies"

### Prompt
**Technical:** The instruction text sent to an LLM to generate a response  
**Business:** The question or instruction we give the AI  
**Example:** "The classification prompt asks about theme relevance" = "We ask the AI if the company matches our themes"

### n8n
**Technical:** A workflow automation platform that orchestrates API calls and data processing  
**Business:** A tool that connects different systems and automates repetitive tasks  
**Example:** "The n8n workflow triggers research" = "An automated process starts the research workflow"

### Webhook
**Technical:** An HTTP endpoint that receives POST requests from external systems  
**Business:** A way for external systems to send us data automatically  
**Example:** "n8n sends results via webhook" = "The automation tool sends us the results when done"

### Batch Processing
**Technical:** Queueing multiple operations and executing them asynchronously  
**Business:** Processing multiple items together instead of one at a time (faster and more efficient)  
**Example:** "Batch classify 100 companies" = "Analyze 100 companies at once instead of one by one"

---

## 🏗️ Technical Architecture Terms

### Supabase
**Technical:** An open-source Firebase alternative providing PostgreSQL, Auth, Storage, and Edge Functions  
**Business:** The cloud platform that stores data and runs backend code  
**Example:** "Hosted on Supabase" = "Our data and backend systems run on Supabase's cloud"

### PostgreSQL
**Technical:** The relational database management system underlying Supabase  
**Business:** The database software that stores all platform data  
**Example:** "PostgreSQL query" = "Fetching data from the database"

### React
**Technical:** A JavaScript library for building user interfaces with component-based architecture  
**Business:** The framework that powers the interactive website interface  
**Example:** "Built with React" = "The website is modern and interactive"

### TypeScript
**Technical:** A superset of JavaScript with static type checking  
**Business:** A programming language that helps prevent bugs  
**Example:** "Written in TypeScript" = "Uses a safer version of JavaScript"

### Tailwind CSS
**Technical:** A utility-first CSS framework for styling UI components  
**Business:** The design system that makes the interface look consistent and professional  
**Example:** "Styled with Tailwind" = "The interface has a polished, modern design"

### API (Application Programming Interface)
**Technical:** A set of endpoints and protocols for programmatic access to platform features  
**Business:** A way for other software to connect to our platform  
**Example:** "Access via API" = "Other systems can pull data from our platform automatically"

### REST API
**Technical:** A stateless HTTP-based API design pattern  
**Business:** A standard way for software to communicate over the internet  
**Example:** "REST endpoint" = "A web address that returns data"

---

## 📁 Database & Data Structure Terms

### Table
**Technical:** A collection of rows and columns in PostgreSQL  
**Business:** Like a spreadsheet tab, stores a specific type of data  
**Example:** "The themes table" = "The spreadsheet of all investment themes"

### Row
**Technical:** A single record in a database table  
**Business:** One item in a list (e.g., one company, one signal, one theme)  
**Example:** "50 rows returned" = "50 items matched your search"

### Column (Field)
**Technical:** A named attribute of a table with a specific data type  
**Business:** A category of information (e.g., "name", "date", "score")  
**Example:** "The description column" = "The field that contains descriptions"

### Foreign Key
**Technical:** A column that references the primary key of another table  
**Business:** A link between two pieces of data (e.g., this signal links to that theme)  
**Example:** "theme_id is a foreign key" = "This field connects to a specific theme"

### Join
**Technical:** A SQL operation that combines rows from multiple tables based on relationships  
**Business:** Bringing together related data from different lists  
**Example:** "Join themes and signals" = "Show me signals along with their theme names"

### Query
**Technical:** A SELECT statement that retrieves data from the database  
**Business:** Asking the database a question  
**Example:** "Run a query for last week's signals" = "Ask the database for last week's news"

### Migration
**Technical:** A SQL script that modifies database schema (add tables, columns, etc.)  
**Business:** An update to how data is structured in the database  
**Example:** "Running a migration" = "Updating the database structure"

---

## 🔐 Security & Access Terms

### Authentication (Auth)
**Technical:** Verifying user identity via login credentials  
**Business:** Making sure you are who you say you are (login process)  
**Example:** "Auth required" = "You must log in to access this"

### Authorization
**Technical:** Determining what actions an authenticated user is allowed to perform  
**Business:** Defining what you're allowed to do once logged in  
**Example:** "Admin authorization" = "Only admins can do this"

### Role
**Technical:** A user_role enum value (admin, analyst, viewer) stored in the user_roles table  
**Business:** Your job title/permission level in the system  
**Example:** "Analyst role" = "You have analyst permissions"

### RLS Policy
**Technical:** A PostgreSQL policy that filters rows based on auth.uid() or role checks  
**Business:** A security rule that controls who can see what data  
**Example:** "RLS blocks other users' data" = "Security rules prevent you from seeing others' private data"

### JWT (JSON Web Token)
**Technical:** A cryptographically signed token used for stateless authentication  
**Business:** A secure temporary ID that proves you're logged in  
**Example:** "JWT expired" = "Your login session timed out"

---

## 🔄 Workflow & Process Terms

### Pipeline
**Technical:** A series of automated data transformation steps  
**Business:** An assembly line for data processing  
**Example:** "The signal processing pipeline" = "The automated workflow that analyzes news articles"

### ETL (Extract, Transform, Load)
**Technical:** The process of extracting raw data, transforming it, and loading it into the database  
**Business:** Collecting messy data, cleaning it up, and organizing it  
**Example:** "ETL process" = "How we get data from sources into our system"

### Cron Job
**Technical:** A scheduled task that runs at specified intervals  
**Business:** A timer that automatically runs a task (like checking websites daily)  
**Example:** "Daily cron job" = "Automatic task that runs every day"

### Real-time
**Technical:** Data processing with minimal latency (<1 second)  
**Business:** Instant or near-instant updates  
**Example:** "Real-time processing" = "Results appear immediately"

### Async (Asynchronous)
**Technical:** Operations that run in the background without blocking the UI  
**Business:** The system does work behind the scenes while you continue using it  
**Example:** "Async batch processing" = "You can keep working while the system processes your batch"

---

## 📈 Scoring & Assessment Terms

### Criteria
**Technical:** A row in `framework_criteria` with name, description, weight, and scoring rubric  
**Business:** One specific thing you evaluate when scoring a company  
**Example:** "5 criteria in this category" = "5 specific questions to answer when assessing this aspect"

### Category
**Technical:** A grouping of criteria in `framework_categories` with a display order and weight  
**Business:** A section of the scorecard (e.g., "Market Opportunity", "Technology Readiness")  
**Example:** "This category is weighted 30%" = "This section counts for 30% of the total score"

### Weighted Score
**Technical:** Sum of (criteria score * criteria weight) / sum of weights  
**Business:** A final score that takes into account which criteria are more important  
**Example:** "Weighted score of 75" = "Overall score after accounting for importance of each section"

### Rubric
**Technical:** A JSON object defining score ranges and their meanings for a criterion  
**Business:** Guidelines that explain what each score means  
**Example:** "80-100: Excellent market size" = "Definition of what counts as a high score"

### Confidence Level
**Technical:** An enum (High, Medium, Low) indicating data quality or certainty  
**Business:** How sure we are about this score (High = very sure, Low = needs more research)  
**Example:** "Low confidence" = "We don't have enough data to be certain yet"

---

## 🌐 Source & Content Terms

### RSS Feed
**Technical:** An XML-based standard for syndicating web content  
**Business:** A format that websites use to publish their latest articles automatically  
**Example:** "Subscribe to the RSS feed" = "Get automatic updates from this website"

### HTML Scraping
**Technical:** Parsing HTML DOM structure to extract specific elements via CSS selectors  
**Business:** Reading a website like a human would and copying specific information  
**Example:** "Scrape headlines" = "Automatically extract article titles from the website"

### CSS Selector
**Technical:** A string that identifies HTML elements (e.g., "div.article-title")  
**Business:** Instructions for finding specific information on a webpage  
**Example:** "Selector for title" = "The rule that finds article titles"

### User Agent
**Technical:** An HTTP header that identifies the client making the request  
**Business:** How the system identifies itself when visiting websites  
**Example:** "Using Mozilla user agent" = "Pretending to be a regular web browser"

### CORS Proxy
**Technical:** A server that forwards requests and adds CORS headers to bypass browser restrictions  
**Business:** A helper that lets the website load content from other websites  
**Example:** "Using CORS proxy" = "Going through a helper service to load the page"

---

## 📊 Reporting & Intelligence Terms

### Memo
**Technical:** A row in `intelligence_memos` with sections for deals, regulatory, and market news  
**Business:** Weekly summary report highlighting key signals and insights  
**Example:** "This week's memo" = "This week's intelligence summary"

### Signal Type
**Technical:** An enum value (Deal, Regulatory, Market News, Research) in the signal_type_classified column  
**Business:** What kind of information this is  
**Example:** "Deal signal" = "An M&A or funding announcement"

### Memo Section
**Technical:** An enum value (Deals, Regulatory, Market News, In Memo, Out of Memo) determining where the signal appears  
**Business:** Which part of the weekly report this signal belongs in  
**Example:** "In Deals section" = "Will appear in the M&A section of the report"

### Country Tag
**Technical:** An array column storing ISO country codes or names  
**Business:** Which countries this signal is relevant to  
**Example:** "Tagged: US, EU, China" = "Relevant to these three markets"

### Deal Size
**Technical:** A text field capturing the extracted funding amount (e.g., "$100M")  
**Business:** How much money was involved in a deal  
**Example:** "Deal size: $50M" = "$50 million funding round"

---

## 🛠️ Admin & Management Terms

### Source Monitor
**Technical:** A row in the `sources` table defining scraping configuration and schedule  
**Business:** A configured data source that the system checks regularly  
**Example:** "50 active source monitors" = "We're automatically monitoring 50 websites"

### Check Frequency
**Technical:** An enum (hourly, daily, weekly) determining how often to poll a source  
**Business:** How often the system checks this website for new content  
**Example:** "Daily frequency" = "We check this site once per day"

### Error Message
**Technical:** Text stored in the error_message column when a scraper fails  
**Business:** The reason why the system couldn't get data from a source  
**Example:** "Error: 404 Not Found" = "The website page doesn't exist anymore"

### Last Success
**Technical:** The last_success_at timestamp indicating when the scraper last retrieved data  
**Business:** When we last successfully got new data from this source  
**Example:** "Last success: 2 days ago" = "It's been 2 days since we got new data"

---

## 💾 Storage & Files Terms

### File Path
**Technical:** The object key in Supabase Storage (e.g., "research/theme-123/doc.pdf")  
**Business:** Where a file is stored in the cloud  
**Example:** "File path: /research/..." = "The location of this file in storage"

### Bucket
**Technical:** A top-level storage namespace in Supabase Storage  
**Business:** A folder where files of a certain type are stored  
**Example:** "research-documents bucket" = "The folder for research files"

### Mime Type
**Technical:** A media type identifier (e.g., "application/pdf", "text/csv")  
**Business:** What kind of file this is  
**Example:** "Mime type: PDF" = "This is a PDF document"

### File Size
**Technical:** Integer representing bytes stored  
**Business:** How big the file is  
**Example:** "5 MB file" = "5 megabyte file"

---

## 🔔 Notifications & Updates Terms

### Alert
**Technical:** A high-priority signal or system notification  
**Business:** Something important that requires attention  
**Example:** "Regulatory alert" = "Important policy change that affects investments"

### Status
**Technical:** An enum field (active, draft, archived, pending, etc.)  
**Business:** The current state of something  
**Example:** "Status: Active" = "This is currently in use"

### Timestamp
**Technical:** A timestamp with time zone column storing date and time  
**Business:** When something happened  
**Example:** "Created_at timestamp" = "The date and time this was created"

---

## 📞 Support & Troubleshooting Terms

### Logs
**Technical:** System-generated text records of events, errors, and operations  
**Business:** A history of what the system did (useful for debugging)  
**Example:** "Check the logs" = "Look at the system's activity history to see what went wrong"

### Debug Mode
**Technical:** Running the system with verbose logging and error details exposed  
**Business:** A diagnostic mode that shows detailed information to help find problems  
**Example:** "Enable debug mode" = "Turn on extra information to troubleshoot"

### Uptime
**Technical:** The percentage of time the system is operational and responsive  
**Business:** How reliable the system is (99.9% = almost never down)  
**Example:** "99.9% uptime" = "The system is available 99.9% of the time"

### Latency
**Technical:** The time delay between request and response (measured in milliseconds)  
**Business:** How fast the system responds  
**Example:** "Low latency" = "The system responds quickly"

---

## 🎓 When to Use This Glossary

### In Meetings
When a technical term comes up, reference this glossary to translate for non-technical stakeholders.

### In Reports
When writing for executives, replace technical terms with business-friendly language from this glossary.

### In Training
When onboarding new users, use this glossary to explain platform concepts.

### In Support
When troubleshooting with users, translate error messages using this glossary.

---

**Glossary Version:** 1.0  
**Last Updated:** January 2025  
**Feedback?** Submit suggested terms to add via the Research Team
