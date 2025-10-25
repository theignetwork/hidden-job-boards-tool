# Job Board Categorization System - Investigation Report

**Date**: October 24, 2025
**Total Boards Analyzed**: 1,000 (active boards)

## Executive Summary

The current categorization system has **critical data quality issues** that significantly impact user experience:

- **565+ unique industry values** (due to inconsistent capitalization and synonyms)
- **159 unique experience level values** (should be ~4-5)
- **500+ unique board type values** (excessive fragmentation)
- **Hard-coded frontend filters** don't align with actual data
- **Missing categorization** on 25% of boards

### Critical Issues Found

1. **Case Sensitivity Chaos**: "Technology" (119 boards), "technology" (37 boards), "tech" (15 boards), "Tech" (6 boards) are all separate categories
2. **Healthcare Fragmentation**: "Healthcare" (49), "healthcare" (30), "Health" (2), "health" - all tracked separately despite being the same category
3. **Excessive Uniqueness**: 565 industry values when ~15-20 well-defined categories would suffice
4. **Frontend Mismatch**: Hard-coded filters like "health" only match boards tagged exactly as "health" (10 boards), missing the 79+ healthcare-related boards

---

## 1. Database Schema Analysis

### JobBoard Type Structure
```typescript
export type JobBoard = {
  id: string;
  name: string;
  industry: string[];              // Array of industries
  experience_level: string[];      // Array of experience levels
  remote_friendly: boolean;        // Boolean flag
  board_type: string[];            // Array of board types
  link: string;
  usage_tips: string;
  tags: string[];                  // Array of tags
  board_summary: string;
  created_at: string;
  featured: boolean;               // DOES NOT EXIST in actual database
};
```

**Note**: The `featured` field exists in TypeScript types but **NOT in the actual Supabase database**, causing query errors.

### Categorization Fields

| Field | Type | Purpose | Data Quality |
|-------|------|---------|--------------|
| `industry` | string[] | Primary categorization | ❌ Critical issues |
| `experience_level` | string[] | Seniority filtering | ❌ Critical issues |
| `board_type` | string[] | Board characteristics | ❌ Critical issues |
| `tags` | string[] | Additional metadata | ⚠️ Moderate issues |
| `remote_friendly` | boolean | Remote work filter | ✅ Good |

---

## 2. Industry Categorization Analysis

### Frontend Filters (Hard-Coded)
```javascript
const allIndustries = [
  'tech', 'health', 'finance', 'education', 'nonprofit',
  'government', 'climate', 'design', 'remote', 'startups'
];
```

### Reality Check: Frontend Filter Effectiveness

| Filter | Exact Matches | Related Boards Missed | Effectiveness |
|--------|---------------|----------------------|---------------|
| `tech` | 15 boards | ~200+ tech boards | 7% effective |
| `health` | 10 boards | ~80+ healthcare boards | 11% effective |
| `nonprofit` | 25 boards | ~60+ nonprofit boards | 29% effective |
| `government` | 24 boards | ~50+ government boards | 32% effective |
| `startups` | 14 boards | ~25+ startup boards | 36% effective |

**Problem**: Case-sensitive exact matching means "health" filter misses "Healthcare", "healthcare", "Health IT", "Public Health", etc.

### Top 25 Industries (Actual Data)

| Industry | Board Count | Percentage |
|----------|-------------|------------|
| Technology | 119 | 11.9% |
| Nonprofit | 63 | 6.3% |
| Healthcare | 49 | 4.9% |
| Government | 49 | 4.9% |
| Marketing | 44 | 4.4% |
| Design | 43 | 4.3% |
| technology | 37 | 3.7% |
| Software Engineering | 36 | 3.6% |
| healthcare | 30 | 3.0% |
| Engineering | 30 | 3.0% |
| Entertainment | 29 | 2.9% |
| Customer Support | 27 | 2.7% |
| Philanthropy | 26 | 2.6% |
| Software | 26 | 2.6% |
| nonprofit | 25 | 2.5% |
| Education | 25 | 2.5% |
| Startups | 25 | 2.5% |
| government | 24 | 2.4% |
| Product | 24 | 2.4% |
| Media | 24 | 2.4% |
| Operations | 23 | 2.3% |
| Information Technology | 23 | 2.3% |
| marketing | 22 | 2.2% |
| design | 22 | 2.2% |
| Sustainability | 22 | 2.2% |

### Case Sensitivity Disasters

**Healthcare Example**:
- "Healthcare": 49 boards
- "healthcare": 30 boards
- "Health": 2 boards
- "Public Health": 12 boards
- "Health IT": 7 boards
- "Telehealth": 6 boards
- "health IT": 2 boards
- **Total**: 108+ boards across 10+ variations of "health"

**Technology Example**:
- "Technology": 119 boards
- "technology": 37 boards
- "Tech": 6 boards
- "tech": 15 boards
- "Information Technology": 23 boards
- "information technology": 10 boards
- "IT": 7 boards
- **Total**: 217+ boards across 10+ variations of "tech"

**Nonprofit Example**:
- "Nonprofit": 63 boards
- "nonprofit": 25 boards
- "nonprofit/association": 2 boards
- "Philanthropy": 26 boards
- "philanthropy": 8 boards
- "non-profit": 1 board
- **Total**: 125+ boards across 6+ variations

### Critical Gaps

**Missing from Filters**:
- "Biotechnology" (21 boards) - not captured by "health" or "tech"
- "Cybersecurity" (16 boards) - not captured by "tech"
- "Life Sciences" (18 boards) - not captured
- "Blockchain" (20 boards) - not captured
- "Web3" (19 boards) - not captured
- "Manufacturing" (25+ boards) - not captured
- "Construction" (18+ boards) - not captured

---

## 3. Experience Level Categorization Analysis

### Frontend Filters (Hard-Coded)
```javascript
const allExperienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];
```

### Reality Check: 159 Unique Values (Should be ~5)

**Top 20 Experience Levels**:

| Experience Level | Board Count | Note |
|-----------------|-------------|------|
| Entry-level | 365 | ✅ Correct |
| Mid-level | 355 | ✅ Correct |
| Senior | 305 | ✅ Correct |
| senior | 235 | ❌ Duplicate (lowercase) |
| Executive | 175 | ✅ Correct |
| entry | 163 | ❌ Duplicate |
| mid | 161 | ❌ Duplicate |
| Internship | 139 | ⚠️ Missing from filters |
| entry-level | 130 | ❌ Duplicate (hyphenated) |
| mid-level | 128 | ❌ Duplicate (hyphenated) |
| internship | 101 | ❌ Duplicate (lowercase) |
| executive | 87 | ❌ Duplicate (lowercase) |
| Senior-level | 66 | ❌ Duplicate (variant) |
| All Levels | 35 | ⚠️ Not a level |
| senior-level | 35 | ❌ Duplicate (variant) |
| Freelance/Contract | 28 | ⚠️ Job type, not level |
| contract | 27 | ⚠️ Job type, not level |
| Manager | 23 | ⚠️ Role, not level |
| Contract | 22 | ⚠️ Job type, not level |
| Mid | 21 | ❌ Duplicate |

**Problems**:
1. **"Entry" should be ONE value**, currently: Entry-level (365), Entry (16), entry (163), entry-level (130), Entry level (3), entry_level (1)
2. **"Senior" should be ONE value**, currently: Senior (305), senior (235), Senior-level (66), senior-level (35), Senior level (1), senior_level (1)
3. **Job types mixed with levels**: Contract, Freelance, Internship, Part-time shouldn't be experience levels
4. **Roles mixed with levels**: Manager, Director, Lead, Executive

### Missing from Filters

- "Internship" (240+ boards across variations) - Very common, should be a filter option!
- "Contract/Freelance" (100+ boards) - Job type, needs separate handling

---

## 4. Board Type Categorization Analysis

### Current State: 500+ Unique Values

**Top 20 Board Types**:

| Board Type | Board Count | Percentage |
|-----------|-------------|------------|
| niche | 264 | 26.4% |
| Niche | 187 | 18.7% |
| Multi-employer | 178 | 17.8% |
| Industry-specific | 111 | 11.1% |
| multi-employer | 87 | 8.7% |
| Niche job board | 79 | 7.9% |
| Association | 53 | 5.3% |
| Regional | 53 | 5.3% |
| regional | 49 | 4.9% |
| Remote-only | 49 | 4.9% |
| industry-specific | 45 | 4.5% |
| association | 45 | 4.5% |
| industry | 32 | 3.2% |
| Government | 28 | 2.8% |
| job board | 27 | 2.7% |
| community | 26 | 2.6% |
| Aggregator | 22 | 2.2% |
| government | 20 | 2.0% |
| Community | 20 | 2.0% |
| Curated | 19 | 1.9% |

**Same Issues**: "niche" (264) vs "Niche" (187) vs "Niche job board" (79) - all the same concept!

---

## 5. Tags Analysis

### Top 30 Tags (Most Organized Field)

| Tag | Board Count | Percentage |
|-----|-------------|------------|
| remote | 306 | 30.6% |
| nonprofit | 73 | 7.3% |
| freelance | 68 | 6.8% |
| startup | 63 | 6.3% |
| engineering | 58 | 5.8% |
| marketing | 54 | 5.4% |
| tech | 47 | 4.7% |
| research | 46 | 4.6% |
| sustainability | 42 | 4.2% |
| part-time | 41 | 4.1% |
| telecommute | 41 | 4.1% |
| design | 41 | 4.1% |
| internships | 40 | 4.0% |
| healthcare | 38 | 3.8% |
| contract | 37 | 3.7% |

**Tags are the most consistent field** - generally lowercase, fewer duplicates.

---

## 6. Data Quality Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total active boards** | 1,000 | 100% |
| Boards without industry | 0 | 0% |
| Boards without experience level | 255 | 25.5% |
| Boards without board type | 258 | 25.8% |
| Remote-friendly boards | ~350 | 35% |
| Unique industries | 565 | - |
| Unique experience levels | 159 | - |
| Unique board types | 500+ | - |
| Unique tags | 700+ | - |

---

## 7. Recommendations

### Immediate Fixes (High Priority)

1. **Normalize Industry Values**
   - Implement case-insensitive matching in `useJobBoards.ts`
   - Create industry mapping: `{ "technology": ["Technology", "technology", "Tech", "tech", "IT", "Information Technology"] }`
   - Reduce 565 values to ~20 core categories

2. **Normalize Experience Levels**
   - Standardize to: Entry, Mid, Senior, Executive, Internship
   - Map all variations: "entry-level", "entry", "Entry-level" → "Entry"
   - Separate job types (Contract/Freelance) from experience levels

3. **Add Missing Filter: Healthcare**
   - Currently: "health" filter matches 10 boards
   - Should match: 100+ healthcare-related boards
   - Use expanded matching: ["Healthcare", "healthcare", "Health", "Medical", "Clinical", "Nursing", "Telehealth"]

4. **Fix Featured Field**
   - Remove `featured` from TypeScript type OR add column to database
   - Currently causes query errors

### Medium Priority

5. **Implement Smart Filtering**
   ```typescript
   const industryMap = {
     tech: ['Technology', 'technology', 'Tech', 'tech', 'IT', 'Software', 'SaaS'],
     health: ['Healthcare', 'healthcare', 'Health', 'Medical', 'Clinical', 'Nursing'],
     nonprofit: ['Nonprofit', 'nonprofit', 'Philanthropy', 'philanthropy']
   };
   ```

6. **Add Frontend Filters**
   - Add "Internship" to experience level filters
   - Add "Manufacturing", "Construction", "Biotech" to industry filters
   - Consider nested categories (see below)

7. **Data Cleanup Script**
   - Batch update to standardize existing data
   - Run case-insensitive deduplication
   - Merge synonyms (e.g., "Tech" → "Technology")

### Long-term (Nested Categories)

8. **Consider Nested Category System**
   ```
   Healthcare
   ├── Clinical (Nursing, Physicians, Allied Health)
   ├── Health IT (Telehealth, Health Informatics)
   ├── Biotech/Pharma (Biotechnology, Pharmaceuticals)
   └── Public Health

   Technology
   ├── Software Engineering
   ├── Data & AI (Data Science, Machine Learning)
   ├── Cybersecurity
   └── Web3/Blockchain
   ```

9. **Database Migration**
   - Add `industry_normalized` field with standardized values
   - Add `experience_level_normalized` field
   - Keep original fields for backward compatibility

---

## 8. Specific Healthcare Issue

You mentioned wanting to add "Health" as a category. Here's the current state:

### Current Healthcare Distribution

| Variation | Boards | Captured by "health" filter? |
|-----------|--------|------------------------------|
| Healthcare | 49 | ❌ No |
| healthcare | 30 | ❌ No |
| Health | 2 | ❌ No |
| Public Health | 12 | ❌ No |
| Health IT | 7 | ❌ No |
| Health Informatics | 2 | ❌ No |
| Telehealth | 6 | ❌ No |
| Biotechnology | 21 | ❌ No |
| Pharmaceuticals | 11 | ❌ No |
| Medical | 2 | ❌ No |
| Nursing | 7 | ❌ No |
| Clinical Research | 9 | ❌ No |
| **TOTAL** | **158+** | ❌ 10 boards only |

**Solution**: Implement industry expansion in `useJobBoards.ts` (already partially exists!):

```typescript
// From line 28-42 of useJobBoards.ts
const expandIndustryTerms = (selectedIndustries: string[]): string[] => {
  const expandedTerms: string[] = [];

  selectedIndustries.forEach(industry => {
    if (industry === 'health') {
      // Add all health-related terms
      expandedTerms.push('health', 'healthcare', 'Health', 'medical', 'clinical',
                         'biotech', 'clinical research', 'hospital',
                         'pharmaceutical', 'pharma', 'nursing', 'telehealth');
    } else {
      expandedTerms.push(industry);
    }
  });

  return expandedTerms;
};
```

**This function EXISTS but needs to be enhanced and applied to ALL frontend filters!**

---

## 9. Implementation Roadmap

### Phase 1: Quick Wins (1 week)
- ✅ Update `expandIndustryTerms()` for all 10 frontend filters
- ✅ Add case-insensitive matching
- ✅ Remove `featured` field from TypeScript type
- ✅ Add "Internship" to experience level filters

### Phase 2: Data Cleanup (2 weeks)
- Create migration script to normalize existing data
- Run batch updates in Supabase
- Add `_normalized` columns for standardized values
- Update frontend to use normalized fields

### Phase 3: Enhanced Categorization (1 month)
- Implement nested categories (optional)
- Add category management UI for admins
- Create category suggestion system based on board summary
- Track category usage in analytics

---

## 10. Example: Improved Filter Code

**Current** (page.tsx:69):
```javascript
const allIndustries = ['tech', 'health', 'finance', ...];
```

**Improved**:
```javascript
const industryFilters = {
  tech: {
    label: 'Technology',
    matches: ['Technology', 'technology', 'Tech', 'tech', 'IT', 'Software',
              'Software Engineering', 'SaaS', 'Information Technology']
  },
  health: {
    label: 'Healthcare',
    matches: ['Healthcare', 'healthcare', 'Health', 'Medical', 'Clinical',
              'Nursing', 'Biotechnology', 'Pharmaceuticals', 'Telehealth',
              'Health IT', 'Public Health', 'Clinical Research']
  },
  // ... etc
};
```

---

## Conclusion

The categorization system needs **urgent attention**. The case sensitivity and lack of standardization are causing:

1. **Poor user experience**: Filters don't work as expected
2. **Data fragmentation**: 565 industries when 20 would suffice
3. **Missed opportunities**: Healthcare has 158+ boards but filter only shows 10

**Good news**: The `expandIndustryTerms()` function already exists in `useJobBoards.ts` - it just needs to be enhanced and applied comprehensively.

**Recommended immediate action**:
1. Enhance industry expansion for ALL filters (not just "health")
2. Add case-insensitive matching
3. Add "Internship" as an experience level filter
4. Plan data normalization migration

This will improve the user experience immediately without requiring database changes.
