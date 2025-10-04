# Taxonomy Migration Plan
## Updated Taxonomy v2.0 → Normalized Database Structure

### Overview
This document maps the updated taxonomy from your markdown file to the new normalized database structure, showing name changes and data to be populated.

---

## Theme Name Changes (Old → New)

### DECARBONISATION

#### Mobility Sector
1. **EV Charging Infrastructure** → No change
2. **Fleet Electrification Services** → **Fleet Electrification** (removed "Services")
3. **Alternative Fuel Infrastructure & Services** → **Alternative Fuels** (simplified)
4. **Public & Shared Transport Digital Platforms** → **Public & Shared Transport** (removed "Digital Platforms")
5. **Logistics Decarbonisation Platforms** → **Logistics Decarbonisation** (removed "Platforms")
6. **Battery Lifecycle Services (Mobility Context)** → **Battery Lifecycle** (removed context note)
7. **Marine Decarbonisation Platforms** → **Marine & Aviation Decarbonisation** (EXPANDED SCOPE - now includes aviation)

#### Buildings Sector
8. **Building Control & Optimization Systems** → **Building Control & Optimization** (removed "Systems")
9. **Building Retrofit & Envelope Services** → **Building Retrofits** (simplified)
10. **Residential Decarbonisation Platforms** → **Residential Decarbonisation** (removed "Platforms")
11. **Green Building Materials & Supply Chain** → **Sustainable Construction Materials** (renamed for clarity)

#### Industry Sector
12. **Industrial Energy Efficiency & Optimisation** → No change
13. **Industrial Electrification & Heat Pump Services** → **Industrial Electrification & Heat** (simplified, broadened scope)
14. **Industrial Emissions Monitoring & MRV Platforms** → **Industrial Emissions Management** (simplified, expanded scope)

#### Agriculture Sector
15. **Precision Agriculture & Data Platforms** → **Precision Agriculture** (removed "& Data Platforms")
16. **Regenerative Farming Services** → **Regenerative Farming** (removed "Services")

---

### ENERGY TRANSITION

#### Renewable Energy Generation Sector  
17. **Renewable EPC & O&M Services** → **Renewable Energy EPC & O&M** (added "Energy")
18. **(NEW)** → **Renewable Energy Software & Analytics** - NEW THEME #18
19. **Clean Energy Advisory & Development Services** → **Clean Energy Advisory & Project Development** (clarified)
20. **Green Workforce & Skills Platforms** → **Green Workforce & Skills** (removed "Platforms")

#### Energy Transmission Sector
21. **Grid Infrastructure & Connection Services** → **Grid Infrastructure & Connection** (removed "Services")
22. **Smart Grid & Demand Response Platforms** → **Smart Grid & Demand Response** (removed "Platforms")
23. **Grid Operations & Maintenance Services** → **Grid Operations & Maintenance** (removed "Services")

#### Energy Storage Sector
24. **Storage Integration & O&M Services** → **Storage Integration & O&M** (removed "Services")
25. **Storage Software & Optimisation Platforms** → **Storage Software & Analytics** (changed "Optimisation Platforms" to "Analytics")

---

### RESOURCE SUSTAINABILITY

#### Water Management Sector
26. **(NEW)** → **Water Treatment & Reuse** - NEW THEME #26
27. **Energy Management & Optimization Software** → **Water Efficiency & Management** (COMPLETELY CHANGED - was misplaced energy theme)

#### Waste & Circular Economy Sector
28. **Recycling & Material Recovery Services** → **Recycling & Material Recovery** (removed "Services")
29. **Waste Treatment & Diversion Services** → **Waste Treatment & Diversion** (removed "Services")
30. **Circular Logistics & Reverse Supply Chains** → **Reverse Logistics & Refurbishment** (renamed for clarity)
31. **Circular Business Model Platforms** → **Sharing & Reuse Models** (renamed for clarity)
32. **Sustainable Materials & Packaging** → No change
33. **Upcycling & Remanufacturing Services** → **Upcycling & Remanufacturing** (removed "Services")

#### Land & Conservation Sector
34. **Natural Capital & Ecosystem Services** → No change
35. **Ecosystem Restoration Services** → **Ecosystem Restoration** (removed "Services")
36. **Sustainable Land Management Services** → **Sustainable Land Management** (removed "Services")

#### Pollution Reduction Sector
37. **Air Quality Monitoring & Control** → No change
38. **Industrial Emissions Control Services** → **Soil & Water Remediation** (COMPLETELY CHANGED)
39. **Soil Remediation Services** → **Climate Technology & Innovation** (COMPLETELY CHANGED - was soil, now climate tech)

---

## Summary of Changes

### Name Changes Only (25 themes)
- Mostly removing "Services", "Platforms", "Systems" suffixes for cleaner names
- Examples: "Fleet Electrification Services" → "Fleet Electrification"

### Scope Expansions (3 themes)
1. **Marine Decarbonisation → Marine & Aviation Decarbonisation** (added aviation)
2. **Industrial Electrification & Heat Pump Services → Industrial Electrification & Heat** (broader heat technologies)
3. **Industrial Emissions Monitoring → Industrial Emissions Management** (monitoring + mitigation)

### Major Reclassifications (4 themes)
1. **Theme #18**: NEW - Renewable Energy Software & Analytics (was missing)
2. **Theme #26**: NEW - Water Treatment & Reuse (was missing)
3. **Theme #27**: Changed from "Energy Management Software" to "Water Efficiency & Management"
4. **Theme #38**: Changed from "Industrial Emissions Control" to "Soil & Water Remediation"
5. **Theme #39**: Changed from "Soil Remediation" to "Climate Technology & Innovation"

### No Changes (7 themes)
- EV Charging Infrastructure
- Industrial Energy Efficiency & Optimisation
- Sustainable Materials & Packaging
- Natural Capital & Ecosystem Services
- Air Quality Monitoring & Control
- Storage Integration & O&M
- And a few others with minor punctuation changes

---

## Database Impact Analysis

### Existing Database State
- **Current themes table**: 39 themes (old structure, old names)
- **New taxonomy tables**: Empty (just created)

### Migration Strategy Options

#### Option A: Clean Migration (Recommended)
1. Populate new taxonomy tables with updated v2.0 data
2. Keep old `themes` table for backwards compatibility during transition
3. Update application to use new taxonomy tables
4. Eventually deprecate old `themes` table

#### Option B: In-Place Update
1. Update names in existing `themes` table
2. Also populate new taxonomy tables
3. Risk: May break existing classifications if companies are linked to theme IDs

**Recommendation**: Go with **Option A** to avoid breaking existing company classifications.

---

## Next Steps

1. **Review & Approve** this mapping document
2. **Generate SQL** to populate new taxonomy tables with full v2.0 data (all fields: description, impact, in_scope, out_of_scope, example_companies, common_edge_cases, key_identifiers)
3. **Test** the new taxonomy structure in the management UI
4. **Migrate** existing company classifications to new taxonomy (separate task)
5. **Deprecate** old themes table once migration complete

---

## Questions for Confirmation

1. Should we keep the old `themes` table for now (Option A) or update it in place (Option B)?
2. Do you want to migrate existing company → theme classifications immediately, or run parallel systems?
3. Any corrections needed to the theme name mappings above?
