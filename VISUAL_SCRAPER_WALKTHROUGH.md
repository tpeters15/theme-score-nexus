# Visual Scraper System - Complete Walkthrough

## How It All Connects: Step-by-Step

Let me walk you through **exactly** how the visual selector system works, from user clicking a button to n8n scraping data.

---

## Part 1: User Adds a New Source

### **User Journey:**

```
1. User navigates to /scraper-management
   ↓
2. Fills in form:
   - Name: "European Commission Press"
   - URL: "https://ec.europa.eu/commission/presscorner/home/en"
   - Type: "HTML (Visual)"
   ↓
3. Clicks "Configure Selectors"
   ↓
4. Visual Builder dialog opens
```

### **What Happens Behind the Scenes:**

```typescript
// ScraperManagement.tsx

const handleStartBuilder = () => {
  // Validation
  if (!sourceName || !sourceUrl) {
    toast({ title: "Missing information" });
    return;
  }

  // Open dialog with VisualSelectorBuilder component
  setShowBuilder(true);
};
```

---

## Part 2: Visual Builder Loads the Website

### **The Challenge: CORS**

When you load a website in an iframe, browsers block it due to CORS (Cross-Origin Resource Sharing) policies.

**Solution: CORS Proxy**

```typescript
// VisualSelectorBuilder.tsx

useEffect(() => {
  // Use a public CORS proxy
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`;
  setProxyUrl(proxy);
}, [sourceUrl]);

// Then load in iframe
<iframe
  ref={iframeRef}
  src={proxyUrl}
  className="w-full h-full"
  sandbox="allow-same-origin allow-scripts"
/>
```

**What this does:**
1. Your React app requests: `https://api.allorigins.win/raw?url=https://ec.europa.eu/...`
2. The proxy server fetches the EC page
3. The proxy returns it to your iframe
4. Now you can interact with it!

**Alternative (Production):**
- Build your own proxy using Supabase Edge Function
- Use services like ScrapingBee, Bright Data
- Use Browserless.io for headless browser

---

## Part 3: User Clicks Elements on the Page

### **Step 3.1: Inject Click Handler**

When the iframe loads, we inject JavaScript into it:

```typescript
useEffect(() => {
  const iframe = iframeRef.current;
  if (!iframe) return;

  const handleIframeLoad = () => {
    const iframeDoc = iframe.contentDocument;

    // Step 1: Add visual styles
    const style = iframeDoc.createElement('style');
    style.textContent = `
      .scraper-highlight {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px;
        cursor: pointer !important;
      }
      .scraper-selected {
        outline: 3px solid #10b981 !important;
      }
    `;
    iframeDoc.head.appendChild(style);

    // Step 2: Add event listeners
    iframeDoc.addEventListener('click', handleElementClick, true);
    iframeDoc.addEventListener('mouseover', handleMouseOver, true);
  };

  iframe.addEventListener('load', handleIframeLoad);
}, []);
```

**What this does:**
- Adds CSS for visual feedback (blue highlight on hover, green on click)
- Captures all clicks inside the iframe
- Captures mouse movement for highlighting

---

### **Step 3.2: Visual Feedback on Hover**

```typescript
const handleMouseOver = (e: MouseEvent) => {
  if (!selectionMode) return; // Only when user clicked "Select Title" button

  const element = e.target as HTMLElement;
  element.classList.add('scraper-highlight'); // Blue outline
};

const handleMouseOut = (e: MouseEvent) => {
  const element = e.target as HTMLElement;
  element.classList.remove('scraper-highlight'); // Remove outline
};
```

**User Experience:**
```
User clicks "Select Title" button
  ↓
selectionMode = 'title'
  ↓
User hovers over elements in iframe
  ↓
Each element gets blue outline as they hover
  ↓
User sees which element they're about to select
```

---

### **Step 3.3: Generate CSS Selector When Clicked**

```typescript
const handleElementClick = (e: MouseEvent) => {
  if (!selectionMode) return;

  e.preventDefault(); // Don't actually follow links
  e.stopPropagation(); // Don't trigger parent clicks

  const element = e.target as HTMLElement;

  // Visual feedback - green outline
  element.classList.add('scraper-selected');

  // ⭐ THE MAGIC: Generate CSS selector
  const selector = finder(element, {
    root: iframeDoc.body,
    optimizedMinLength: 2,
    threshold: 1000
  });

  // Result example: ".pr-list-item > h3.pr-title"
};
```

### **How `finder()` Works:**

The `@medv/finder` library uses this logic:

```javascript
// Simplified explanation of how finder generates selectors

function finder(element) {
  // Try 1: ID (best if unique)
  if (element.id) {
    return `#${element.id}`;
  }

  // Try 2: Unique class combination
  if (element.className) {
    const classes = element.className.split(' ').join('.');
    const selector = `.${classes}`;

    if (document.querySelectorAll(selector).length === 1) {
      return selector; // Unique! Use it
    }
  }

  // Try 3: Parent context
  const parent = finder(element.parentElement);
  const tagName = element.tagName.toLowerCase();
  const nthChild = Array.from(element.parentElement.children).indexOf(element) + 1;

  return `${parent} > ${tagName}:nth-child(${nthChild})`;
}
```

**Examples:**

| Element HTML | Generated Selector |
|-------------|-------------------|
| `<h3 id="title-123">` | `#title-123` |
| `<h3 class="pr-title">` (unique) | `.pr-title` |
| `<h3 class="pr-title">` (multiple) | `.pr-list-item > .pr-title` |
| `<a href="...">` | `.pr-list-item > a[href]` |

---

### **Step 3.4: Determine What to Extract**

```typescript
// Determine what we're extracting
let elementType: 'text' | 'link' | 'image' | 'date' = 'text';
let attribute: string | undefined;
let sampleValue = element.textContent?.trim() || '';

// Logic: Check element type
if (element.tagName === 'A') {
  elementType = 'link';
  attribute = 'href'; // Extract the href, not the text
  sampleValue = element.getAttribute('href') || '';
}
else if (element.tagName === 'IMG') {
  elementType = 'image';
  attribute = 'src';
  sampleValue = element.getAttribute('src') || '';
}
else if (selectionMode === 'date' || /date|time/i.test(element.className)) {
  elementType = 'date';
}
```

**Result:**

```json
{
  "field": "title",
  "selector": ".pr-title",
  "element_type": "text",
  "sample_value": "New Climate Policy Announced"
}
```

or for a link:

```json
{
  "field": "pdf_link",
  "selector": "a.download-btn",
  "attribute": "href",
  "element_type": "link",
  "sample_value": "/press/2025/policy-123.pdf"
}
```

---

## Part 4: Building the Complete Config

### **User Selects Multiple Fields:**

```
1. User clicks "Select Title" → clicks <h3> element
   → Config: { field: 'title', selector: '.pr-title' }

2. User clicks "Select Link" → clicks <a> element
   → Config: { field: 'link', selector: 'a.pr-link', attribute: 'href' }

3. User clicks "Select Date" → clicks <span> element
   → Config: { field: 'date', selector: '.pr-date' }
```

### **Final Config Object:**

```json
{
  "list_selector": ".pr-list-item",
  "item_selectors": [
    {
      "field": "title",
      "selector": ".pr-title",
      "element_type": "text",
      "sample_value": "New Climate Policy Announced"
    },
    {
      "field": "link",
      "selector": "a.pr-link",
      "attribute": "href",
      "element_type": "link",
      "sample_value": "/press/2025/policy-123.pdf"
    },
    {
      "field": "date",
      "selector": ".pr-date",
      "element_type": "date",
      "sample_value": "2025-10-05"
    }
  ],
  "detail_page": {
    "enabled": true,
    "url_field": "link",
    "selectors": [
      {
        "field": "pdf_url",
        "selector": "a.download-pdf",
        "attribute": "href",
        "element_type": "link"
      },
      {
        "field": "content",
        "selector": ".press-release-content",
        "element_type": "text"
      }
    ]
  }
}
```

---

## Part 5: Saving to Supabase

```typescript
const handleSaveConfig = async (config: any) => {
  const { data, error } = await supabase
    .from('scraper_sources')
    .insert({
      name: 'European Commission Press',
      source_type: 'html_simple',
      url: 'https://ec.europa.eu/...',
      config: config, // ← The JSON object we built
      is_active: false // Start inactive until tested
    })
    .select()
    .single();

  // Navigate to test page
  navigate(`/scraper-test/${data.id}`);
};
```

**Database Row Created:**

| Column | Value |
|--------|-------|
| id | `uuid-123` |
| name | `European Commission Press` |
| source_type | `html_simple` |
| url | `https://ec.europa.eu/...` |
| config | `{list_selector: ..., item_selectors: [...]}` |
| is_active | `false` |

---

## Part 6: n8n Workflow Uses the Config

### **Universal Workflow Reads Config:**

```javascript
// n8n Code Node: "Parse HTML with Config"

const html = $input.first().json; // Fetched HTML
const sourceConfig = $('Loop Over Sources').item.json; // From database

const config = sourceConfig.config; // Our visual config!

// Extract items using the config
const listSelector = config.list_selector; // ".pr-list-item"
const items = extractElements(html, listSelector);

// For each item, extract fields
const signals = items.map(itemHtml => {
  const signal = {};

  // Loop through item_selectors
  config.item_selectors.forEach(selector => {
    const field = selector.field; // "title"
    const css = selector.selector; // ".pr-title"
    const attr = selector.attribute; // undefined or "href"

    if (attr) {
      // Extract attribute (for links, images)
      signal[field] = extractAttribute(itemHtml, css, attr);
    } else {
      // Extract text content
      signal[field] = extractText(itemHtml, css);
    }
  });

  return signal;
});

// Result:
// [
//   { title: "New Climate Policy", link: "/press/...", date: "2025-10-05" },
//   { title: "Green Deal Update", link: "/press/...", date: "2025-10-04" }
// ]
```

### **For Detail Pages:**

```javascript
// If config.detail_page.enabled
if (config.detail_page?.enabled) {
  const detailUrl = signal[config.detail_page.url_field]; // signal.link

  // Fetch detail page
  const detailHtml = await fetch(detailUrl);

  // Extract using detail_page.selectors
  config.detail_page.selectors.forEach(selector => {
    signal[selector.field] = extractText(detailHtml, selector.selector);
  });

  // If PDF link exists
  if (signal.pdf_url) {
    const pdfContent = await downloadAndParsePDF(signal.pdf_url);
    signal.pdf_text = pdfContent;

    // Send to AI for analysis
    const analysis = await claudeAnalyze(pdfContent);
    signal.ai_analysis = analysis;
  }
}
```

---

## Part 7: The Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER INTERFACE (React)                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User clicks:                                          │
│  "Add Scraper" → Enter URL → "Configure Selectors"    │
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │  Visual Builder Opens                       │      │
│  │                                              │      │
│  │  [Website Preview] │ [Config Panel]         │      │
│  │                    │                         │      │
│  │  User clicks       │  Generates:            │      │
│  │  elements →        │  - CSS selectors       │      │
│  │                    │  - Field mappings      │      │
│  │                    │  - Sample values       │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
│  Clicks "Save"                                         │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. DATABASE (Supabase)                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INSERT INTO scraper_sources (                         │
│    name: "EC Press",                                   │
│    source_type: "html_simple",                         │
│    url: "https://...",                                 │
│    config: {                                           │
│      list_selector: ".pr-list-item",                   │
│      item_selectors: [                                 │
│        { field: "title", selector: ".pr-title" },      │
│        { field: "link", selector: "a", attr: "href" }  │
│      ]                                                  │
│    }                                                    │
│  )                                                      │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. N8N WORKFLOW (Automation)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Every 30 min:                                         │
│    ↓                                                   │
│  Fetch active sources from DB                          │
│    ↓                                                   │
│  Loop over each source:                                │
│    ↓                                                   │
│    Fetch HTML from source.url                          │
│    ↓                                                   │
│    Read source.config from DB                          │
│    ↓                                                   │
│    Extract data using CSS selectors in config          │
│    ↓                                                   │
│    [List page]                                         │
│    querySelectorAll(config.list_selector)              │
│    → Get all .pr-list-item elements                    │
│                                                         │
│    For each item:                                      │
│      querySelector(config.item_selectors[0].selector)  │
│      → Extract title                                   │
│      querySelector(config.item_selectors[1].selector)  │
│      → Extract link                                    │
│                                                         │
│    IF config.detail_page.enabled:                      │
│      Fetch detail page                                 │
│      Extract PDF link                                  │
│      Download PDF                                      │
│      Parse PDF text                                    │
│      Send to Claude for analysis                       │
│    ↓                                                   │
│    Transform to signal schema                          │
│    ↓                                                   │
│    Deduplicate                                         │
│    ↓                                                   │
│    INSERT INTO signals                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Key Technical Components

### **1. CSS Selector Generator (`@medv/finder`)**

```bash
npm install @medv/finder
```

```typescript
import { finder } from '@medv/finder';

const selector = finder(clickedElement, {
  root: document.body,
  optimizedMinLength: 2,
  threshold: 1000
});
```

**What it does:** Generates the most reliable CSS selector for an element

---

### **2. CORS Proxy**

**Problem:** Can't load external websites in iframe due to browser security

**Solution:**

```typescript
// Development: Public proxy
const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

// Production: Your own Supabase Edge Function
const proxy = `${SUPABASE_URL}/functions/v1/cors-proxy?url=${encodeURIComponent(url)}`;
```

**Supabase Edge Function:**

```typescript
// supabase/functions/cors-proxy/index.ts
Deno.serve(async (req) => {
  const url = new URL(req.url).searchParams.get('url');
  const response = await fetch(url);
  const html = await response.text();

  return new Response(html, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/html'
    }
  });
});
```

---

### **3. HTML Extraction in n8n**

**Option A: Use HTML Extract Node** (Built-in)

```
HTTP Request → HTML Extract → Code (transform)
```

**Option B: Use Code Node with cheerio**

```javascript
// n8n Code Node
const cheerio = require('cheerio');
const $ = cheerio.load(html);

const items = [];
$(config.list_selector).each((i, item) => {
  const signal = {};

  config.item_selectors.forEach(sel => {
    if (sel.attribute) {
      signal[sel.field] = $(item).find(sel.selector).attr(sel.attribute);
    } else {
      signal[sel.field] = $(item).find(sel.selector).text().trim();
    }
  });

  items.push(signal);
});

return items.map(item => ({ json: item }));
```

---

## Next Steps

Now that you understand the system, here's what to implement:

### **Immediate (Today):**

1. ✅ Visual builder component created
2. ✅ Scraper management page created
3. ⏳ Add route to your app
4. ⏳ Test with one source

### **This Week:**

1. Build CORS proxy edge function
2. Add test extraction endpoint
3. Update n8n workflow to use configs
4. Deploy and test with EC source

### **Questions to Clarify:**

1. **CORS Proxy:** Should I create the Supabase edge function now?
2. **Testing:** Want me to build the test extraction preview?
3. **n8n Integration:** Should I update the universal workflow to use these configs?
4. **UI Polish:** Need the list view of all scrapers with stats?

Which should I tackle next?
