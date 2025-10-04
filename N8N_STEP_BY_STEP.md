# n8n Workflow Modifications - Step by Step

## Overview
You need to convert your chat-based workflow into a batch processing workflow that:
1. Receives batch data via webhook
2. Fetches live taxonomy from Supabase
3. Loops through companies
4. Sends results back to Supabase

## Step-by-Step Instructions

### Step 1: Replace the Trigger Node

**DELETE:** "When chat message received" node

**ADD:** New "Webhook" node
- Click the "+" button → Search "Webhook"
- Settings:
  - **HTTP Method**: POST
  - **Path**: `/classify-batch`
  - **Authentication**: None
  - **Response Mode**: "When Last Node Finishes"
  
**Result:** Copy the webhook URL (will look like `https://your-n8n.com/webhook/classify-batch`)

---

### Step 2: Add "Parse Batch Input" Code Node

**Position:** Connect from Webhook node

**Node Type:** Code → JavaScript

**Replace all code with:**
```javascript
// Extract batch data from the webhook payload
const body = $input.item.json.body;
const batch_id = body.batch_id;
const companies = body.companies;

console.log(`Received batch ${batch_id} with ${companies.length} companies`);

// Return each company as a separate item for the loop
return companies.map(company => ({
  json: {
    batch_id: batch_id,
    company_id: company.id,
    company_name: company.company_name,
    website: company.website
  }
}));
```

---

### Step 3: Add "Fetch Taxonomy from Supabase" HTTP Request Node

**Position:** Before processing companies (parallel to Parse Batch Input)

**Node Type:** HTTP Request

**Settings:**
- **Method**: GET
- **URL**: `https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/get-taxonomy`
- **Authentication**: None (public endpoint)
- **Response Format**: JSON

**Test it:** Click "Test step" - you should see the full taxonomy JSON

---

### Step 4: Add "Loop Over Companies" Node

**Position:** After "Parse Batch Input"

**Node Type:** Loop Over Items

**Settings:**
- **Items**: All items from previous node
- This will process each company one at a time

---

### Step 5: Update "Parse Input" Code Node

**FIND:** Your existing "Parse Input" code node

**REPLACE** the code with:
```javascript
// Get company data from the loop
const company_name = $json.company_name;
const website = $json.website;
const company_id = $json.company_id;
const batch_id = $json.batch_id;

// Extract domain from website
const domainMatch = website.match(/https?:\/\/([^\s\/]+)/);

if (!domainMatch) {
  console.error(`Invalid website URL: ${website}`);
  throw new Error(`Invalid website URL: ${website}`);
}

return {
  company_name: company_name,
  website: website,
  domain: domainMatch[1],
  company_id: company_id,
  batch_id: batch_id
};
```

---

### Step 6: Keep Perplexity Research Node (No Changes)

Your existing "Perplexity Research" HTTP Request node stays the same.

---

### Step 7: Update the Classification Code Node

**FIND:** The Code node that has `const TAXONOMY_JSON = \`{...}\`;` (the huge hardcoded JSON)

**REPLACE** the beginning of the code:

**OLD:**
```javascript
const TAXONOMY_JSON = `{
  "business_models": [...],
  "pillars": {...}
}`;
```

**NEW:**
```javascript
// Fetch taxonomy from the earlier node
const taxonomy = $('Fetch Taxonomy from Supabase').item.json;
const TAXONOMY_JSON = JSON.stringify(taxonomy);

// Keep the rest of your existing code below...
const perplexityResponse = $input.item.json.choices[0].message.content;
const companyName = $('Parse Input').item.json.company_name;
// ... etc
```

**Important:** Keep all the rest of your classification logic - just replace how you get the taxonomy!

---

### Step 8: Update the Classification Result Storage

**FIND:** The last Code node that processes the GPT response

**ADD** at the end of that node's code:
```javascript
// Add company_id and batch_id to the result
return {
  json: {
    company_id: $('Parse Input').item.json.company_id,
    batch_id: $('Parse Input').item.json.batch_id,
    company_name: $('Parse Input').item.json.company_name,
    classification: {
      primary_theme: primaryTheme,  // your existing variable
      confidence_score: confidenceScore,  // your existing variable
      rationale: rationale  // your existing variable
    }
  }
};
```

---

### Step 9: Add "Aggregate Results" Code Node

**Position:** After the Loop node (connect to the "Done" output of the loop)

**Node Type:** Code → JavaScript

```javascript
// Get all items from the loop
const allItems = $input.all();

// Extract batch_id (same for all items)
const batch_id = allItems[0].json.batch_id;

// Build results array
const results = allItems.map(item => ({
  company_id: item.json.company_id,
  primary_theme: item.json.classification?.primary_theme || 'Unclassified',
  confidence_score: item.json.classification?.confidence_score || 0,
  rationale: item.json.classification?.rationale || 'Classification failed'
}));

console.log(`Aggregated ${results.length} classifications for batch ${batch_id}`);

return {
  json: {
    batch_id: batch_id,
    results: results
  }
};
```

---

### Step 10: Add "Send Results to Supabase" HTTP Request Node

**Position:** Final node after "Aggregate Results"

**Node Type:** HTTP Request

**Settings:**
- **Method**: POST
- **URL**: `https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/batch-classification-webhook`
- **Authentication**: None
- **Send Body**: Yes
- **Body Content Type**: JSON
- **Body**:
```json
{
  "batch_id": "={{ $json.batch_id }}",
  "results": "={{ $json.results }}"
}
```

---

## Final Workflow Structure

```
1. Webhook Trigger
     ↓
2. Parse Batch Input (splits into array)
     ↓
3. Fetch Taxonomy from Supabase (parallel)
     ↓
4. Loop Over Companies ──┐
     ↓                    │
5. Parse Input           │
     ↓                    │
6. Perplexity Research   │
     ↓                    │
7. Format Research       │
     ↓                    │
8. GPT Classification    │
     ↓                    │
9. Parse Classification  │
     ↓                    │
   [Loop back] ──────────┘
     ↓
10. Aggregate Results
     ↓
11. Send to Supabase
```

---

## Testing the Workflow

### 1. Activate the Workflow
- Click "Active" toggle in top right

### 2. Copy Your Webhook URL
- Click on the Webhook node
- Copy the "Production URL"
- Should look like: `https://your-n8n.com/webhook/classify-batch`

### 3. Update the Classifier Page

In your Lovable project, update these files with your webhook URL:

**File:** `src/components/classifier/SingleCompanyClassifier.tsx`
**Line 58:** Replace `"YOUR_N8N_WEBHOOK_URL"` with your actual webhook URL

**File:** `src/components/classifier/ManualBatchClassifier.tsx`
**Line 95:** Replace `"YOUR_N8N_WEBHOOK_URL"` with your actual webhook URL

**File:** `src/components/classifier/FileUploadClassifier.tsx`
**Line 101:** Replace `"YOUR_N8N_WEBHOOK_URL"` with your actual webhook URL

### 4. Test with a Single Company

1. Go to `/classifier` in your app
2. Click "Single Company" tab
3. Enter:
   - Company: Tesla
   - Website: https://tesla.com
4. Click "Classify Company"

### 5. Monitor n8n Execution

- Go to n8n → Executions
- You should see a new execution running
- Click on it to see each node's output
- It should complete and update your Supabase `classifications` table

---

## Troubleshooting

### Webhook not triggering
- Check that workflow is "Active"
- Verify webhook URL is correct in Lovable code
- Check browser console for CORS errors (expected with `mode: 'no-cors'`)

### Taxonomy not loading
- Test the "Fetch Taxonomy" node directly
- Check Supabase edge function logs: https://supabase.com/dashboard/project/blwwpvvdnpkipjgajwiw/functions/get-taxonomy/logs

### Classification not updating in Supabase
- Check the final HTTP Request node output
- Check Supabase webhook logs: https://supabase.com/dashboard/project/blwwpvvdnpkipjgajwiw/functions/batch-classification-webhook/logs
- Verify `batch_id` and `company_id` match your database records

### Loop not working
- Make sure "Parse Batch Input" returns an array
- Check Loop node is connected to the "All" output
- Verify the loop's "Done" output connects to "Aggregate Results"

---

## Key Changes Summary

| Old | New |
|-----|-----|
| Chat trigger | Webhook trigger |
| Single company input | Batch array input |
| Hardcoded taxonomy JSON | Live fetch from Supabase |
| Manual result copying | Automatic webhook update |
| One execution per company | One execution per batch |

---

## Next Steps After Testing

1. ✅ Test single company classification
2. ✅ Test manual batch (2-3 companies)
3. ✅ Test CSV upload (small file first)
4. ✅ Monitor Supabase classifications table
5. ✅ Check confidence scores and themes
6. ✅ Scale up to larger batches
