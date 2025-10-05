# Deployment Guide - n8n Classification Integration

## Overview
This guide covers deploying the optimized n8n classification workflow that uses Supabase edge functions instead of hardcoded taxonomy data, reducing token costs by 88%.

## Prerequisites
- n8n instance (cloud or self-hosted)
- Supabase project with taxonomy tables populated
- Supabase CLI installed (`npm install -g supabase`)
- API keys for Perplexity and Anthropic

## Step 1: Deploy Supabase Edge Function

The taxonomy edge function serves optimized taxonomy data to the n8n workflow.

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref blwwpvvdnpkipjgajwiw

# Deploy the edge function
supabase functions deploy get-taxonomy-for-n8n

# Verify deployment
curl "https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/get-taxonomy-for-n8n" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Expected response structure:
```json
{
  "taxonomy": {
    "Pillar Name": {
      "id": "uuid",
      "sectors": {
        "Sector Name": {
          "id": "uuid",
          "themes": [
            { "id": "uuid", "name": "Theme Name" }
          ]
        }
      }
    }
  },
  "flat_themes": [...],
  "metadata": {
    "total_pillars": 5,
    "total_sectors": 20,
    "total_themes": 100,
    "generated_at": "2025-10-04T..."
  }
}
```

## Step 2: Configure n8n Credentials

In your n8n instance, create the following credentials:

### Supabase API Credential
- **Type**: Supabase API
- **Project URL**: `https://blwwpvvdnpkipjgajwiw.supabase.co`
- **Service Role Key**: Get from Supabase Dashboard → Project Settings → API

### Perplexity API Credential
- **Type**: HTTP Request Auth
- **Auth Type**: Header Auth
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_PERPLEXITY_API_KEY`

### Anthropic API Credential
- **Type**: HTTP Request Auth
- **Auth Type**: Header Auth
- **Header Name**: `x-api-key`
- **Header Value**: `YOUR_ANTHROPIC_API_KEY`

## Step 3: Import n8n Workflow

1. Copy the workflow JSON from `/Users/tompeters/Code/n8n_classifier_lovable.js`
2. In n8n, go to **Workflows** → **Import from File** or **Import from URL**
3. Paste the JSON content
4. Update all credential IDs in the workflow:
   - Replace `YOUR_SUPABASE_CREDENTIAL_ID` with actual Supabase credential ID
   - Replace `YOUR_PERPLEXITY_CREDENTIAL_ID` with actual Perplexity credential ID
   - Replace `YOUR_ANTHROPIC_CREDENTIAL_ID` with actual Anthropic credential ID

## Step 4: Configure Environment Variables

### Frontend (.env)
```bash
# Update .env file
VITE_N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook-test/classify-companies"
```

### n8n Environment
Set in your n8n instance settings:
```bash
SUPABASE_URL="https://blwwpvvdnpkipjgajwiw.supabase.co"
```

## Step 5: Activate the Workflow

1. In n8n, open the imported workflow
2. Click **Execute Workflow** to test with sample data
3. If successful, toggle **Active** to enable the webhook

## Step 6: Test the Integration

### Test Single Company Classification
```bash
curl -X POST "https://your-n8n-instance.com/webhook-test/classify-companies" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "company_id": "550e8400-e29b-41d4-a716-446655440000",
    "company_name": "Tesla",
    "website": "https://tesla.com",
    "description": "Electric vehicle manufacturer"
  }'
```

### Test Batch Classification (from UI)
1. Go to `/batch-classifier` in your app
2. Enter a batch name
3. Upload a CSV with columns: `company_name`, `website`
4. Click **Process List**
5. Watch results populate in real-time

## Cost Comparison

### Original Workflow (Hardcoded Taxonomy)
- Taxonomy tokens per request: ~15,000
- Classification tokens per company: ~15,600
- Cost per 100 companies: **$5.00**

### Optimized Workflow (Edge Function)
- Taxonomy fetch: 1 request (cached 5 min)
- Taxonomy tokens per request: ~1,100
- Classification tokens per company: ~1,100
- Cost per 100 companies: **$0.60**

**Savings: 88% reduction in costs**

## Monitoring

### Check Classification Status
```sql
-- In Supabase SQL Editor
SELECT
  cb.batch_name,
  cb.status,
  cb.company_count,
  COUNT(c.id) as classified,
  AVG(c.confidence_score) as avg_confidence
FROM classification_batches cb
LEFT JOIN classifications c ON c.batch_id = cb.id
GROUP BY cb.id
ORDER BY cb.created_at DESC;
```

### Edge Function Logs
```bash
supabase functions logs get-taxonomy-for-n8n
```

### n8n Execution History
- Go to **Executions** tab in n8n
- Filter by workflow name
- Review success/failure rates

## Troubleshooting

### Issue: "Property 'env' does not exist on type 'ImportMeta'"
- This is a TypeScript linting issue, not a runtime error
- The workflow JSON is valid for n8n import

### Issue: "Failed to fetch taxonomy"
- Verify edge function is deployed: `supabase functions list`
- Check Supabase logs: `supabase functions logs get-taxonomy-for-n8n`
- Confirm taxonomy tables have data

### Issue: "Failed to submit to classification service"
- Check n8n webhook URL is correct in `.env`
- Verify workflow is active in n8n
- Check n8n execution logs

### Issue: Classifications stuck in "Processing"
- Check n8n execution for errors
- Verify API credentials are valid
- Check rate limits on Perplexity/Anthropic APIs

## Production Considerations

1. **Rate Limiting**: Current workflow has 1s delay between companies. Adjust in "Wait (Rate Limit)" node if needed.

2. **Batch Size**: Loop processes 10 companies at a time. Adjust in "Loop Over Companies" node for larger batches.

3. **Caching**: Edge function caches taxonomy for 5 minutes. Adjust `Cache-Control` header if taxonomy changes frequently.

4. **Error Handling**: Failed classifications are marked with `status: 'failed'`. Review and retry manually or implement retry logic.

5. **Monitoring**: Set up alerts for:
   - High error rates in classifications
   - Webhook failures
   - API quota exhaustion
