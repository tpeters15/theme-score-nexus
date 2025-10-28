# Delta Metis Project Transfer Checklist

> **Purpose**: Step-by-step guide for transferring the Delta Metis Intelligence Platform from personal Lovable account to corporate Delta Metis account.

---

## Pre-Transfer Preparation

### 1. Document Current Configuration

**Supabase Connection**:
- [ ] Note current Supabase project ID: `blwwpvvdnpkipjgajwiw`
- [ ] Note current Supabase URL: `https://blwwpvvdnpkipjgajwiw.supabase.co`
- [ ] Confirm you have admin access to this Supabase project
- [ ] **Decision**: Will you keep the same Supabase project or create a new corporate one?
  - **Option A**: Keep existing (simpler, no data migration)
  - **Option B**: Create new corporate Supabase project (cleaner separation, requires data migration)

**GitHub Repository** (if connected):
- [ ] Note current GitHub repository URL
- [ ] Note default branch name
- [ ] Export list of open issues/PRs (if any)
- [ ] **Decision**: Will you create a new corporate GitHub organization?

**Secrets/Environment Variables**:
- [ ] Verify these secrets are set in current project:
  - `LOVABLE_API_KEY`
  - `FIRECRAWL_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DB_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
- [ ] Document which secrets need to be recreated (if using new Supabase project)

**n8n Integration**:
- [ ] Note n8n workspace URL: `https://towerbrook.app.n8n.cloud`
- [ ] Export n8n workflows:
  - `n8n_universal_scraper.json` (already in project)
  - Any other custom workflows
- [ ] List n8n credentials that need updating (if Supabase project changes)

**DealCloud Integration**:
- [ ] Note DealCloud API endpoint URL
- [ ] Verify DealCloud API credentials location (n8n or Supabase secrets)
- [ ] Export `dealcloud_theme_mapping` table data for reference

### 2. Create Knowledge Transfer Documents

- [x] `LOVABLE_AI_CONTEXT.md` - Comprehensive technical documentation
- [x] `TRANSFER_CHECKLIST.md` - This checklist
- [ ] Export critical database data as CSV for reference:
  ```sql
  -- Export taxonomy
  COPY (
    SELECT p.name as pillar, s.name as sector, t.name as theme, t.description
    FROM taxonomy_themes t
    JOIN taxonomy_sectors s ON s.id = t.sector_id
    JOIN taxonomy_pillars p ON p.id = s.pillar_id
    WHERE t.is_active = true
    ORDER BY p.display_order, s.display_order, t.name
  ) TO '/tmp/taxonomy_export.csv' CSV HEADER;
  
  -- Export framework criteria
  COPY (
    SELECT fc.code as category, fcr.code, fcr.name, fcr.description
    FROM framework_criteria fcr
    JOIN framework_categories fc ON fc.id = fcr.category_id
    ORDER BY fc.display_order, fcr.display_order
  ) TO '/tmp/framework_export.csv' CSV HEADER;
  ```
- [ ] Screenshot key dashboard pages for reference
- [ ] Export sample data (optional, for testing):
  - 10-20 sample raw signals
  - 5-10 sample classified companies
  - Current theme scores for reference

### 3. Prepare Corporate Accounts

**Delta Metis Lovable Account**:
- [ ] Confirm access to "Delta Metis" Lovable workspace
- [ ] Verify workspace has sufficient credits/subscription
- [ ] Note workspace settings/preferences

**Corporate GitHub** (if creating new repo):
- [ ] Create GitHub organization (if needed): e.g., `delta-metis` or `towerbrook-delta-metis`
- [ ] Verify team members who need access
- [ ] Prepare repository name: e.g., `intelligence-platform` or `delta-metis-platform`

**Corporate Supabase** (if creating new project):
- [ ] Create Supabase organization for Delta Metis/TowerBrook
- [ ] Create new Supabase project: e.g., "delta-metis-prod"
- [ ] Note new project ID and URL
- [ ] Enable required extensions: `uuid-ossp`, `pgcrypto`
- [ ] Create initial admin user account

---

## Transfer Execution

### 4. Perform Lovable Project Transfer

**Steps**:
1. [ ] In current Lovable project, click project name (top left)
2. [ ] Click "Settings"
3. [ ] Scroll to "Transfer Project" section
4. [ ] Select destination workspace: **"Delta Metis"**
5. [ ] Read transfer warnings carefully:
   - ✅ Project code and structure will transfer
   - ✅ Project settings will transfer
   - ✅ Direct invitations will remain
   - ⚠️  Workspace member access will change
   - ⚠️  GitHub connection may need to be re-established
   - ⚠️  Supabase connection may need to be re-established
   - ❌ **Chat history will NOT transfer** (this is why we created `LOVABLE_AI_CONTEXT.md`)
6. [ ] Click "Confirm transfer"
7. [ ] Wait for transfer confirmation
8. [ ] Switch to "Delta Metis" workspace in Lovable
9. [ ] Verify project appears in projects list

**Immediate Post-Transfer Checks**:
- [ ] Project loads in Lovable editor
- [ ] Code files are intact (spot-check key files)
- [ ] No build errors in preview window
- [ ] Navigate through main routes to verify functionality

---

## Post-Transfer Reconnection

### 5. Reconnect GitHub

**Option A: Keep Existing Repository** (simpler)
1. [ ] In transferred project, click GitHub button (top right)
2. [ ] If disconnected, click "Connect to GitHub"
3. [ ] Authorize Lovable GitHub App for Delta Metis account
4. [ ] Select existing repository
5. [ ] Verify connection successful
6. [ ] Test: Make a small code change, verify it pushes to GitHub

**Option B: Create New Corporate Repository**
1. [ ] In GitHub, create new repository in corporate organization
2. [ ] In transferred Lovable project, click GitHub → Connect to GitHub
3. [ ] Authorize Lovable GitHub App
4. [ ] Select the new repository
5. [ ] Initial push will populate new repo with current code
6. [ ] Verify: Check new repo on GitHub, all files should be present
7. [ ] Update any CI/CD pipelines or webhooks to point to new repo
8. [ ] Archive old repository (or transfer ownership to corporate account)

**GitHub Settings to Verify**:
- [ ] Branch protection rules (if applicable)
- [ ] Collaborators/teams have correct access
- [ ] Repository settings (visibility, features enabled)

### 6. Reconnect or Configure Supabase

**Option A: Keep Existing Supabase Project** (simpler, no data migration)
1. [ ] Verify Supabase connection in Lovable project settings
2. [ ] If disconnected, reconnect using existing project credentials
3. [ ] Test connection: Run a simple query from frontend
4. [ ] Verify Edge Functions still work:
   - [ ] Test `/functions/v1/get-taxonomy` endpoint
   - [ ] Test company classification workflow
5. [ ] **IMPORTANT**: Add Delta Metis team members to Supabase project
6. [ ] Grant admin access to relevant team members
7. [ ] Update Supabase organization billing if needed

**Option B: Migrate to New Corporate Supabase Project** (clean separation)

**⚠️  WARNING**: This is complex and requires careful planning. Only choose if corporate governance requires it.

1. **Create New Project**:
   - [ ] Create new Supabase project in corporate organization
   - [ ] Note new project ID, URL, and keys
   - [ ] Enable same extensions as original: `uuid-ossp`, `pgcrypto`

2. **Schema Migration**:
   - [ ] Export schema from original project:
     ```bash
     # Via Supabase CLI
     supabase db dump --db-url "postgresql://postgres:[password]@[old-project-ref].supabase.co:5432/postgres" -f schema.sql --schema public
     ```
   - [ ] Review `schema.sql` for sensitive data or environment-specific settings
   - [ ] Import schema to new project:
     ```bash
     supabase db push --db-url "postgresql://postgres:[password]@[new-project-ref].supabase.co:5432/postgres" -f schema.sql
     ```

3. **Data Migration**:
   - [ ] Export data from original project (in dependency order):
     ```bash
     # Export tables (order matters due to foreign keys)
     pg_dump --data-only --table=taxonomy_pillars [old-connection] > data/pillars.sql
     pg_dump --data-only --table=taxonomy_sectors [old-connection] > data/sectors.sql
     pg_dump --data-only --table=taxonomy_themes [old-connection] > data/themes.sql
     pg_dump --data-only --table=taxonomy_business_models [old-connection] > data/business_models.sql
     pg_dump --data-only --table=framework_categories [old-connection] > data/categories.sql
     pg_dump --data-only --table=framework_criteria [old-connection] > data/criteria.sql
     # ... repeat for all tables
     ```
   - [ ] Import data to new project (same order):
     ```bash
     psql [new-connection] < data/pillars.sql
     psql [new-connection] < data/sectors.sql
     # ... continue in order
     ```
   - [ ] Verify data integrity:
     ```sql
     -- Compare row counts
     SELECT 'taxonomy_themes' as table_name, COUNT(*) FROM taxonomy_themes
     UNION ALL
     SELECT 'companies', COUNT(*) FROM companies
     -- ... for all tables
     ```

4. **Storage Migration**:
   - [ ] Create `research-documents` bucket in new project (public)
   - [ ] Download files from old bucket:
     ```bash
     # Via Supabase CLI or manual download from dashboard
     supabase storage cp --project-ref [old-project-ref] research-documents/ ./backup/research-documents/ --recursive
     ```
   - [ ] Upload to new bucket:
     ```bash
     supabase storage cp ./backup/research-documents/ --project-ref [new-project-ref] research-documents/ --recursive
     ```
   - [ ] Verify file access via public URLs

5. **Update Lovable Project**:
   - [ ] In Lovable, update Supabase connection to new project
   - [ ] Update `src/integrations/supabase/client.ts` with new URL and keys (should auto-update)
   - [ ] Verify connection: Test a simple query

6. **Update External Integrations**:
   - [ ] Update n8n workflows with new Supabase credentials
   - [ ] Update any external scripts/tools using Supabase API
   - [ ] Update DealCloud webhook endpoints (if they changed)

7. **Testing**:
   - [ ] Run full application test suite
   - [ ] Manually test critical workflows:
     - [ ] User authentication
     - [ ] Company classification
     - [ ] Signal scraping (trigger n8n manually)
     - [ ] Framework scoring
     - [ ] DealCloud sync
   - [ ] Verify data consistency between old and new projects

8. **Cutover**:
   - [ ] Set old Supabase project to read-only (optional)
   - [ ] Monitor new project for 24-48 hours
   - [ ] If stable, deactivate old project (or keep as backup for 30 days)

### 7. Update Secrets and Environment Variables

**Required Secrets** (verify in Lovable project settings):
- [ ] `LOVABLE_API_KEY` - Lovable AI API access
  - Should remain the same (account-level credential)
  - Verify in Lovable project settings → Secrets
- [ ] `FIRECRAWL_API_KEY` - Firecrawl scraping service
  - Should remain the same (account-level credential)
  - Verify still valid by testing scraper
- [ ] `SUPABASE_URL` - If new project, update
- [ ] `SUPABASE_ANON_KEY` - If new project, update
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - If new project, update
- [ ] `SUPABASE_DB_URL` - If new project, update
- [ ] `SUPABASE_PUBLISHABLE_KEY` - If new project, update

**For New Supabase Project** (Option 6B):
1. [ ] Get new keys from Supabase dashboard → Settings → API
2. [ ] Update each secret in Lovable → Project Settings → Secrets
3. [ ] Redeploy Edge Functions to pick up new environment variables
4. [ ] Test Edge Function with new keys

### 8. Update n8n Workflows

**If Supabase Project Changed**:
1. [ ] Open n8n workspace: `https://towerbrook.app.n8n.cloud`
2. [ ] Update credentials:
   - [ ] Supabase credentials → Update URL and service role key
3. [ ] Update workflows:
   - [ ] Universal Scraper workflow
   - [ ] DealCloud Sync workflow
   - [ ] Any custom workflows
4. [ ] Test workflows:
   - [ ] Execute manually
   - [ ] Verify data appears in new Supabase project
   - [ ] Check for errors in execution logs

**If Supabase Project Stayed Same**:
- [ ] No changes needed
- [ ] Test workflows to verify still functioning
- [ ] Update n8n workspace access for Delta Metis team members

### 9. Verify DealCloud Integration

**If Supabase Project Changed**:
1. [ ] Update DealCloud webhook URLs in database triggers (if they reference old project)
2. [ ] Test sync:
   - [ ] Classify a test company
   - [ ] Verify webhook fires
   - [ ] Check `dealcloud_sync_log` for successful sync
   - [ ] Verify data appears in DealCloud

**If Supabase Project Stayed Same**:
- [ ] Test existing sync with a dummy company
- [ ] Verify `dealcloud_sync_log` shows recent activity

### 10. Update Team Access

**Lovable Project**:
- [ ] Invite Delta Metis team members to project
- [ ] Grant appropriate roles (admin/editor)
- [ ] Remove personal account members (if needed)

**Supabase**:
- [ ] Add team members to Supabase organization
- [ ] Grant appropriate access levels
- [ ] Create user accounts in application (via Auth)
- [ ] Assign roles in `user_roles` table:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES 
     ('user-uuid-1', 'admin'),
     ('user-uuid-2', 'analyst');
   ```

**GitHub**:
- [ ] Add team members to repository
- [ ] Configure team permissions
- [ ] Set up branch protection rules

**n8n**:
- [ ] Share n8n workflows with team
- [ ] Grant edit/view access as appropriate

---

## Post-Transfer Verification

### 11. Comprehensive Application Testing

**Authentication**:
- [ ] Sign up new test user
- [ ] Verify email confirmation (if enabled)
- [ ] Log in with test user
- [ ] Verify user profile created in `profiles` table
- [ ] Test Google OAuth (if configured)
- [ ] Log out and back in

**Dashboard**:
- [ ] Load dashboard (`/`)
- [ ] Verify KPIs display correctly
- [ ] Verify featured signals appear
- [ ] Check charts render (if any)
- [ ] Test date filters

**Themes**:
- [ ] Navigate to Themes page (`/themes`)
- [ ] Verify themes list loads
- [ ] Click on a theme → Theme Profile
- [ ] Verify framework scores display
- [ ] Test score editing (if admin)
- [ ] Verify overall score calculates correctly

**Signals**:
- [ ] Navigate to Signals page (`/signals`)
- [ ] Verify signals table loads
- [ ] Test filtering by signal type, date, source
- [ ] Click on a signal → detail modal
- [ ] Verify content displays correctly

**Company Classification**:
- [ ] Navigate to Classifier page (`/classifier`)
- [ ] Test single company classification:
   - [ ] Enter company name, website, description
   - [ ] Click "Classify"
   - [ ] Wait for AI response
   - [ ] Verify themes and business models returned
   - [ ] Save classification
   - [ ] Verify appears in database
- [ ] Test batch classification (CSV upload)
- [ ] Verify DealCloud sync triggers (check logs)

**Regulatory Tracker**:
- [ ] Navigate to Regulatory Tracker (`/regulatory-tracker`)
- [ ] Verify regulations list loads
- [ ] Test filtering by jurisdiction, impact level
- [ ] Click on regulation → detail modal
- [ ] Verify theme links display
- [ ] Test creating new regulation (if admin)

**Research Library**:
- [ ] Navigate to Research page (`/research`)
- [ ] Verify documents list loads
- [ ] Click on a document → viewer
- [ ] Verify PDF/DOCX renders correctly
- [ ] Test upload (if admin):
   - [ ] Select file
   - [ ] Associate with theme/criteria
   - [ ] Upload
   - [ ] Verify appears in storage bucket
   - [ ] Verify appears in table

**Admin Functions** (if admin role):
- [ ] Navigate to Taxonomy Management (`/taxonomy-management`)
- [ ] Test creating new theme
- [ ] Test editing existing theme
- [ ] Verify framework scores auto-created for new theme
- [ ] Test creating new sector/pillar
- [ ] Test bulk operations:
   - [ ] Populate theme signals
   - [ ] Populate sources
   - [ ] Bulk score update

**Scraper Management**:
- [ ] Navigate to Source Monitors (`/source-monitors`)
- [ ] Verify sources list loads
- [ ] Click on a source → Source Profile
- [ ] Verify run history displays
- [ ] Test adding new source
- [ ] Trigger scraper manually (via n8n)
- [ ] Verify new signals appear in `raw_signals`

### 12. Performance Checks

- [ ] Page load times reasonable (<3s for main pages)
- [ ] No console errors in browser DevTools
- [ ] No failed network requests (check Network tab)
- [ ] Database queries complete in <1s (check Supabase logs)
- [ ] Edge functions respond in <5s (check function logs)

### 13. Data Integrity Checks

**Database**:
```sql
-- Verify key table counts
SELECT 
  (SELECT COUNT(*) FROM taxonomy_themes WHERE is_active = true) as active_themes,
  (SELECT COUNT(*) FROM companies) as companies,
  (SELECT COUNT(*) FROM raw_signals) as raw_signals,
  (SELECT COUNT(*) FROM processed_signals) as processed_signals,
  (SELECT COUNT(*) FROM detailed_scores) as framework_scores,
  (SELECT COUNT(*) FROM user_roles) as users_with_roles;

-- Verify no orphaned records (foreign key integrity)
SELECT 'Orphaned company_theme_mappings' as issue, COUNT(*) as count
FROM company_theme_mappings ctm
WHERE NOT EXISTS (SELECT 1 FROM companies c WHERE c.id = ctm.company_id)
   OR NOT EXISTS (SELECT 1 FROM taxonomy_themes t WHERE t.id = ctm.theme_id)
UNION ALL
SELECT 'Orphaned detailed_scores', COUNT(*)
FROM detailed_scores ds
WHERE NOT EXISTS (SELECT 1 FROM taxonomy_themes t WHERE t.id = ds.theme_id)
   OR NOT EXISTS (SELECT 1 FROM framework_criteria fc WHERE fc.id = ds.criteria_id);

-- Should return 0 for all checks
```

**Storage**:
- [ ] Verify bucket is public: `https://blwwpvvdnpkipjgajwiw.supabase.co/storage/v1/object/public/research-documents/`
- [ ] Test accessing a file via public URL
- [ ] Verify file sizes match original (spot-check)

**Edge Functions**:
- [ ] All functions deployed: Check Supabase Dashboard → Edge Functions
- [ ] No failed deployments: Check deployment logs
- [ ] Test critical functions:
   ```bash
   curl https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/get-taxonomy
   curl https://blwwpvvdnpkipjgajwiw.supabase.co/functions/v1/get-business-models
   ```

---

## Knowledge Seeding (Critical!)

### 14. Upload AI Context to Lovable Project

**Since chat history DOES NOT transfer**, seed the AI's knowledge manually:

1. [ ] In transferred project, click project name → Settings
2. [ ] Navigate to "Manage Knowledge" section
3. [ ] Click "Add Knowledge" or "Upload Document"
4. [ ] Upload **`LOVABLE_AI_CONTEXT.md`**
5. [ ] Verify upload successful
6. [ ] Test AI's knowledge:
   - [ ] Ask: "What is the overall theme score calculation?"
   - [ ] AI should reference framework categories A-D
   - [ ] Ask: "How does company classification work?"
   - [ ] AI should describe the edge function and AI prompt flow

**Alternative if Upload Fails**:
- Copy entire contents of `LOVABLE_AI_CONTEXT.md`
- Paste into a new chat message (may be truncated, so use upload if possible)
- Ask AI to confirm it understands the system architecture

### 15. Validate AI Understanding

**Test Queries** (ask AI and verify responses):
- [ ] "What tables store framework scores?" → Should mention `detailed_scores`, `framework_categories`, `framework_criteria`
- [ ] "How are signals deduplicated?" → Should mention `signal_id` and `fingerprint`
- [ ] "What's the difference between raw_signals and processed_signals?" → Should explain immutable vs. enriched data
- [ ] "How do I add a new scraping source?" → Should describe `sources` table and n8n workflow
- [ ] "Why are business models independent, not theme-specific?" → Should explain company attributes vs. theme properties

**If AI Doesn't Know**:
- Re-upload `LOVABLE_AI_CONTEXT.md`
- Try pasting key sections into chat
- Continue development with explicit context in each request

---

## Documentation Updates

### 16. Update Project Documentation

**Files to Update** (with new project details):
- [ ] `README.md`
  - Update project description to mention corporate context
  - Update setup instructions with new Supabase project (if changed)
  - Update GitHub repository URL
- [ ] `DEPLOYMENT.md`
  - Update Supabase project references
  - Update GitHub repository references
  - Update deployment URLs
- [ ] `EXECUTIVE_SUMMARY.md`
  - Update stakeholder references to Delta Metis team
  - Update access URLs
- [ ] `N8N_WORKFLOW_SETUP.md`
  - Update Supabase credentials instructions
  - Update webhook URLs (if changed)

**New Documentation to Create**:
- [ ] `TEAM_ACCESS.md` - List of team members and their roles
- [ ] `DEPLOYMENT_URLS.md` - Production, staging, and development URLs
- [ ] `CREDENTIALS_GUIDE.md` - Where to find API keys, credentials (for onboarding)

### 17. Archive Transfer Documentation

- [ ] Create `transfer-history/` directory
- [ ] Move this checklist to `transfer-history/TRANSFER_CHECKLIST_2025-01-28.md`
- [ ] Document transfer date, participants, and outcome
- [ ] Note any issues encountered and resolutions

---

## Ongoing Maintenance

### 18. Set Up Monitoring

**Lovable**:
- [ ] Set up project notifications (settings → notifications)
- [ ] Configure build alerts
- [ ] Monitor deployment status regularly

**Supabase**:
- [ ] Enable database monitoring
- [ ] Set up alerts for:
  - High query duration (>1s average)
  - High error rate
  - Storage quota approaching limit
- [ ] Configure backups (should be automatic, verify schedule)

**n8n**:
- [ ] Set up execution error alerts
- [ ] Monitor scraper run frequency
- [ ] Check for failed workflows daily

**DealCloud**:
- [ ] Monitor `dealcloud_sync_log` for errors
- [ ] Set up weekly sync health report (SQL query)

### 19. Establish Backup Procedures

**Database Backups** (Supabase handles automatically, but verify):
- [ ] Confirm daily backups enabled
- [ ] Test restore procedure (on test project):
  1. Create point-in-time backup
  2. Restore to new project
  3. Verify data integrity

**Code Backups** (via GitHub):
- [ ] Confirm pushes happening on every code change
- [ ] Create tagged release (e.g., `v1.0-transfer-complete`)
- [ ] Document release notes

**Knowledge Backups**:
- [ ] Export `LOVABLE_AI_CONTEXT.md` to corporate drive (Google Drive/SharePoint)
- [ ] Export key SQL queries and scripts
- [ ] Document tribal knowledge in project wiki or Confluence

### 20. Team Onboarding

**Prepare Onboarding Guide**:
- [ ] Create `ONBOARDING.md` with:
  - Project overview
  - How to access Lovable, Supabase, n8n, GitHub
  - Common tasks and workflows
  - Who to contact for help
- [ ] Schedule onboarding sessions for new team members
- [ ] Create video walkthrough (optional, very helpful)

**Initial Access Setup**:
- [ ] Create user accounts for all team members
- [ ] Assign roles in `user_roles` table
- [ ] Grant Lovable project access
- [ ] Grant Supabase access
- [ ] Grant GitHub repository access
- [ ] Grant n8n workflow access
- [ ] Send welcome email with access details

---

## Final Validation

### 21. End-to-End System Test

**Complete User Journey** (as analyst role):
1. [ ] Log in to application
2. [ ] View dashboard, explore featured signals
3. [ ] Navigate to Signals page, filter to deals from last week
4. [ ] Click on a signal, read full content
5. [ ] Navigate to Themes page, open "EV Charging Hardware" theme
6. [ ] Review framework scores, update one score (A1: Market Size)
7. [ ] Upload a research document (PDF) to support the score
8. [ ] Navigate to Classifier page
9. [ ] Classify a test company: "ChargePoint Holdings Inc."
10. [ ] Verify classification results appear
11. [ ] Check DealCloud sync log for success
12. [ ] Navigate to Regulatory Tracker
13. [ ] Create a test regulation: "UK Net Zero Strategy 2025"
14. [ ] Link regulation to "EV Charging Infrastructure" theme
15. [ ] Verify regulation appears on theme profile
16. [ ] Log out

**Expected Outcome**: All steps complete without errors

**If Any Step Fails**:
- [ ] Document the issue
- [ ] Check relevant logs (browser console, Supabase, Edge Functions, n8n)
- [ ] Fix and re-test
- [ ] Update this checklist with resolution notes

### 22. Stakeholder Demo

**Prepare Demo**:
- [ ] Create demo script showing key features
- [ ] Prepare sample data (if production data is sensitive)
- [ ] Test demo flow beforehand

**Demo Checklist**:
- [ ] Dashboard overview (5 min)
- [ ] Signal tracking and processing (5 min)
- [ ] Company classification (5 min)
- [ ] Theme framework scoring (5 min)
- [ ] Regulatory tracking (3 min)
- [ ] Q&A and feedback (10 min)

**Collect Feedback**:
- [ ] Document stakeholder feedback
- [ ] Create issues/tasks for any requested changes
- [ ] Prioritize improvements for next sprint

### 23. Go-Live Approval

- [ ] All tests passed
- [ ] Team onboarded
- [ ] Stakeholders approved
- [ ] No critical bugs outstanding
- [ ] Monitoring in place
- [ ] Backup procedures verified

**Sign-Off**:
- [ ] Project Manager approval
- [ ] Technical Lead approval
- [ ] Business stakeholder approval

**Officially Transition**:
- [ ] Announce go-live to team
- [ ] Update project status to "Production"
- [ ] Archive old personal account project (or delete after 30-day safety period)

---

## Post-Go-Live

### 24. First Week Monitoring

**Daily Checks** (for first 7 days):
- [ ] Review Supabase logs for errors
- [ ] Check n8n workflow execution success rate
- [ ] Monitor DealCloud sync log for failures
- [ ] Review user activity and feedback
- [ ] Check for any performance degradation

**Issues Log**:
- Create a shared document to track any post-launch issues
- Triage daily
- Resolve critical issues within 24 hours

### 25. Retrospective

**After 1-2 Weeks**, conduct transfer retrospective:
- [ ] What went well?
- [ ] What could be improved?
- [ ] Any surprises or unexpected issues?
- [ ] Lessons learned for future transfers/migrations
- [ ] Update this checklist with improvements

**Update Documentation**:
- [ ] Incorporate lessons learned into `LOVABLE_AI_CONTEXT.md`
- [ ] Update `README.md` with any new setup notes
- [ ] Archive retrospective notes in project wiki

---

## Emergency Rollback Plan

**If Transfer Fails Catastrophically**:

1. **Immediate Actions**:
   - [ ] Notify team of issues
   - [ ] Switch back to old personal account project (should still be accessible)
   - [ ] Restore any Supabase connections that were changed
   - [ ] Communicate timeline for resolution

2. **Assess Damage**:
   - [ ] Identify what broke
   - [ ] Determine if data was lost or corrupted
   - [ ] Document root cause

3. **Decide Path Forward**:
   - **Option A**: Fix issues and retry transfer
   - **Option B**: Operate from personal account temporarily while debugging
   - **Option C**: Restore from backup to new project and start fresh

4. **Prevention**:
   - [ ] Always test on a separate test project first (if possible)
   - [ ] Never delete original project until new project stable for 30+ days
   - [ ] Maintain communication with Lovable support during transfer

---

## Completion Checklist

**Transfer Complete When**:
- [x] Project transferred to Delta Metis Lovable workspace
- [ ] GitHub reconnected (or new repo created and connected)
- [ ] Supabase reconnected (or data migrated to new project)
- [ ] All secrets/environment variables updated
- [ ] n8n workflows updated and tested
- [ ] DealCloud integration verified
- [ ] Team access granted to all systems
- [ ] Comprehensive testing completed successfully
- [ ] AI knowledge seeded via `LOVABLE_AI_CONTEXT.md`
- [ ] Documentation updated
- [ ] Monitoring and backups configured
- [ ] Stakeholder demo completed and approved
- [ ] Go-live approval obtained
- [ ] First week post-launch monitoring completed
- [ ] Retrospective conducted and documented

**Total Estimated Time**:
- **Pre-Transfer Prep**: 4-6 hours
- **Transfer Execution**: 1-2 hours
- **Post-Transfer Reconnection**: 2-4 hours (Option A), 8-16 hours (Option B with migration)
- **Testing & Validation**: 4-6 hours
- **Documentation & Onboarding**: 2-4 hours
- **Total**: 13-32 hours depending on complexity

---

## Support Contacts

**Lovable Support**:
- Discord: https://discord.com/channels/1119885301872070706/1280461670979993613
- Email: support@lovable.dev
- Docs: https://docs.lovable.dev/

**Supabase Support**:
- Discord: https://discord.supabase.com/
- Docs: https://supabase.com/docs
- Support: https://supabase.com/dashboard/support

**n8n Support**:
- Community: https://community.n8n.io/
- Docs: https://docs.n8n.io/

**Internal Team Contacts**:
- Project Lead: [Name, Email]
- Technical Lead: [Name, Email]
- Lovable Admin: [Name, Email]
- Supabase Admin: [Name, Email]

---

**Document Version**: 1.0  
**Created**: 2025-01-28  
**Last Updated**: 2025-01-28  
**Next Review**: Post-transfer retrospective
