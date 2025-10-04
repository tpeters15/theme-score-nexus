# n8n Batch Classification Workflow Setup

## Overview
This guide shows you how to modify your existing n8n workflow to:
1. Accept batch data from the BatchClassifier page
2. Fetch live taxonomy from Supabase
3. Process companies in a loop
4. Send results back to Supabase

## Edge Function URLs

Your Supabase project URLs:
- **Get Taxonomy**: `https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/get-taxonomy`
- **Results Webhook**: `https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/batch-classification-webhook`

## Required n8n Workflow Changes

### 1. Replace "When chat message received" trigger

**DELETE:** The chat trigger node

**ADD:** Webhook trigger node with these settings:
- **Node Type**: `Webhook`
- **HTTP Method**: `POST`
- **Path**: `/classify-batch` (or any path you prefer)
- **Response Mode**: `When last node finishes`

### 2. Add "Parse Batch Input" node (Code node)

**Position**: Right after webhook trigger

**Code**:
```javascript
// Extract batch data from webhook
const { batch_id, companies } = $input.item.json.body;

console.log(`Received batch ${batch_id} with ${companies.length} companies`);

return companies.map(company => ({
  json: {
    batch_id,
    company_name: company.company_name,
    website: company.website,
    company_id: company.id  // We'll need this to update the right record
  }
}));
```

### 3. Add "Fetch Taxonomy" node (HTTP Request)

**Position**: Before the loop starts

**Settings**:
- **Method**: `GET`
- **URL**: `https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/get-taxonomy`
- **Response Format**: `JSON`

This replaces the hardcoded `TAXONOMY_JSON` in your current workflow.

### 4. Update "Parse Input" node

**REPLACE** the existing code with:
```javascript
const company_name = $json.company_name;
const website = $json.website;
const company_id = $json.company_id;
const batch_id = $json.batch_id;

const domainMatch = website.match(/https?:\/\/([^\s\/]+)/);

if (!domainMatch) {
  throw new Error(`Invalid website URL: ${website}`);
}

return {
  company_name,
  website,
  domain: domainMatch[1],
  company_id,
  batch_id
};
```

### 5. Update Classification Code Node

**REPLACE** the line:
```javascript
const TAXONOMY_JSON = `{...}`;
```

**WITH**:
```javascript
const taxonomy = $('Fetch Taxonomy').item.json;
const TAXONOMY_JSON = JSON.stringify(taxonomy);
```

This uses the live taxonomy from Supabase instead of hardcoded JSON.

### 6. Add "Aggregate Results" node (Code node)

**Position**: After all companies are processed (use Loop Node's "Done" output)

**Code**:
```javascript
const allItems = $input.all();
const batch_id = allItems[0].json.batch_id;

const results = allItems.map(item => ({
  company_id: item.json.company_id,
  primary_theme: item.json.classification?.primary_theme || 'Unclassified',
  confidence_score: item.json.classification?.confidence_score || 0,
  rationale: item.json.classification?.rationale || 'No classification available'
}));

return {
  json: {
    batch_id,
    results
  }
};
```

### 7. Add "Send Results to Supabase" node (HTTP Request)

**Position**: Final node after aggregation

**Settings**:
- **Method**: `POST`
- **URL**: `https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/batch-classification-webhook`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body**: 
```json
{
  "batch_id": "={{ $json.batch_id }}",
  "results": "={{ $json.results }}"
}
```

## Workflow Structure

```
1. Webhook Trigger (receives batch data)
     ↓
2. Parse Batch Input (extract companies array)
     ↓
3. Fetch Taxonomy (GET request to Supabase)
     ↓
4. Loop Over Companies
     ↓
5. Parse Input (extract company details)
     ↓
6. Perplexity Research (unchanged)
     ↓
7. Format Perplexity (unchanged)
     ↓
8. GPT Classification (use live taxonomy)
     ↓
9. Parse Classification (unchanged)
     ↓
10. [Loop back to #4 until all companies done]
     ↓
11. Aggregate Results (combine all classifications)
     ↓
12. Send Results to Supabase (POST webhook)
```

## Testing the Workflow

1. **Activate** the workflow in n8n
2. **Copy** the webhook URL (should look like: `https://your-n8n.com/webhook/classify-batch`)
3. **Update** `src/pages/BatchClassifier.tsx` line with your webhook URL
4. **Upload** a test CSV on the BatchClassifier page
5. **Monitor** n8n execution logs and Supabase classifications table

## Expected Data Flow

### Input to n8n (from BatchClassifier):
```json
{
  "batch_id": "uuid-here",
  "companies": [
    {
      "id": "company-uuid-1",
      "company_name": "Tesla",
      "website": "https://tesla.com"
    },
    {
      "id": "company-uuid-2",
      "company_name": "ChargePoint",
      "website": "https://chargepoint.com"
    }
  ]
}
```

### Output from n8n (to Supabase):
```json
{
  "batch_id": "uuid-here",
  "results": [
    {
      "company_id": "company-uuid-1",
      "primary_theme": "EV Charging Infrastructure",
      "confidence_score": 0.92,
      "rationale": "Primary business is EV charging network operations..."
    },
    {
      "company_id": "company-uuid-2",
      "primary_theme": "EV Charging Infrastructure",
      "confidence_score": 0.95,
      "rationale": "Leading public charging network operator..."
    }
  ]
}
```

## Next Steps

1. Import the modified workflow to n8n
2. Configure Perplexity AI credentials
3. Test with a small batch (2-3 companies)
4. Monitor execution logs
5. Verify results appear in BatchClassifier page

## Troubleshooting

- **Taxonomy not loading**: Check edge function logs at https://supabase.com/dashboard/project/blwwpvvdnpkipjgajwiw/functions/get-taxonomy/logs
- **Results not updating**: Check webhook logs at https://supabase.com/dashboard/project/blwwpvvdnpkipjgajwiw/functions/batch-classification-webhook/logs
- **n8n errors**: Check n8n execution logs for detailed error messages
