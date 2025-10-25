# Analytics Tracking - Simplified for RAG Integration

## Overview
Analytics tracking has been simplified to capture only essential events needed for RAG-powered recommendations, reducing event volume by ~70% while keeping all data needed for intelligent recommendations.

## Tracked Events (4 Total)

### 1. board_viewed
**When**: User clicks to view board details (title link or "View" button)

**Data Captured**:
```json
{
  "board_id": "uuid",
  "board_name": "Board Name",
  "industry": ["tech", "startups"],
  "experience_level": ["Entry", "Mid"],
  "remote_friendly": true
}
```

**Purpose**: Understand which boards users are interested in, track viewing patterns by industry/experience/remote preferences

---

### 2. board_favorited
**When**: User clicks favorite/heart icon to add board to favorites

**Data Captured**:
```json
{
  "board_id": "uuid",
  "board_name": "Board Name"
}
```

**Purpose**: Identify high-value boards that users want to save for later, signal strong user interest

---

### 3. board_unfavorited
**When**: User clicks favorite/heart icon to remove board from favorites

**Data Captured**:
```json
{
  "board_id": "uuid",
  "board_name": "Board Name"
}
```

**Purpose**: Track when users change their mind about boards, understand board retention

---

### 4. search_performed
**When**: User searches (debounced - only fires 300ms after user stops typing, minimum 3 characters)

**Data Captured**:
```json
{
  "search_query": "user search term",
  "filters_applied": {
    "industry": ["tech", "health"],
    "experience": ["Mid", "Senior"],
    "remote": true
  },
  "results_count": 42
}
```

**Purpose**: Understand user search behavior, identify what users are looking for, track filter usage patterns

---

## What Was Removed

### Removed Events (4):
- ❌ **page_loaded** - Not needed for recommendations
- ❌ **filter_applied** - Redundant (captured in search_performed)
- ❌ **filter_cleared** - Not actionable for RAG
- ❌ **tab_changed** - Not relevant for recommendations

### Removed Data:
All browser context enrichment removed from every event:
- ❌ user_agent
- ❌ screen_width
- ❌ screen_height
- ❌ referrer
- ❌ url

**Rationale**: Browser/device data doesn't help with job board recommendations. We only need board preferences and search behavior.

---

## Event Volume Reduction

**Before**: ~8 event types × browser context = high volume, lots of noise
**After**: 4 event types × minimal data = focused signal for RAG

**Estimated Reduction**: ~70% fewer events tracked

---

## RAG Integration Benefits

### 1. User Profile Building
From `board_viewed` + `board_favorited`:
- Preferred industries
- Experience level match
- Remote work preference
- Board types of interest

### 2. Search Pattern Analysis
From `search_performed`:
- Common search terms
- Popular filter combinations
- Zero-result searches (opportunity to improve)
- Search to favorite conversion

### 3. Recommendation Engine Input
Combined data enables:
- "Users who viewed X also viewed Y"
- "Based on your favorites, you might like..."
- "People searching for [term] often favorite these boards"
- Industry/experience-based suggestions

### 4. Content Gap Identification
From `search_performed` with low results_count:
- Underserved industries
- Missing experience levels
- Needed board types

---

## Database Schema

Event stored in `user_activity_events` table:
```sql
{
  id: UUID,
  event_type: TEXT,
  user_id: TEXT,
  event_data: JSONB,
  timestamp: TIMESTAMPTZ
}
```

Indexes on:
- event_type
- user_id
- timestamp
- board_id (from event_data)
- Full JSONB (GIN index)

---

## Implementation Details

### Files Modified:
1. **src/lib/analytics.ts**
   - Reduced from 8 to 4 event types
   - Removed browser context enrichment
   - Updated `trackBoardView()` to include board details
   - Updated `trackSearch()` to include filters
   - Removed `trackFilterApplied()`, `trackFilterCleared()`, `trackPageLoad()`, `trackTabChange()`

2. **src/hooks/useJobBoards.ts**
   - Removed separate `trackFilterApplied()` call
   - Removed `trackFilterCleared()` call
   - Combined search + filters into single `trackSearch()` event

3. **src/app/page.tsx**
   - Removed `trackPageLoad()` call
   - Removed `trackTabChange()` call and `handleTabChange()` function

4. **src/components/BoardCard.tsx**
   - Updated to pass full board details to `trackBoardView()`
   - Passes: id, name, industries, experienceLevels, remoteFriendly

---

## Usage Examples

### Query Popular Boards:
```sql
SELECT * FROM get_popular_boards(10, '7 days');
```

### Query Popular Searches:
```sql
SELECT * FROM get_popular_searches(20, '7 days');
```

### Find Boards Viewed by Users Searching for "remote":
```sql
SELECT
  event_data->>'board_id',
  event_data->>'board_name',
  COUNT(*) as views
FROM user_activity_events
WHERE event_type = 'board_viewed'
  AND user_id IN (
    SELECT DISTINCT user_id
    FROM user_activity_events
    WHERE event_type = 'search_performed'
      AND event_data->>'search_query' ILIKE '%remote%'
  )
GROUP BY event_data->>'board_id', event_data->>'board_name'
ORDER BY views DESC
LIMIT 10;
```

### Favorite Conversion Rate:
```sql
SELECT
  COUNT(CASE WHEN event_type = 'board_favorited' THEN 1 END)::FLOAT /
  COUNT(CASE WHEN event_type = 'board_viewed' THEN 1 END) as fav_rate
FROM user_activity_events
WHERE event_data->>'board_id' = 'specific-board-uuid';
```

---

## Next Steps for RAG Integration (Phase 3)

1. **Generate embeddings** for board names + summaries
2. **Vector search** using user's favorite boards as query
3. **Personalized recommendations** based on view/favorite history
4. **Search enhancement** using semantic similarity instead of exact match
5. **Q&A system** - "What are the best boards for remote senior engineers in tech?"

---

## Success Metrics

Track these to validate simplified analytics:

- ✅ **Event volume reduced** by ~70%
- ✅ **No loss of recommendation-relevant data**
- ✅ **Cleaner data** for RAG training
- ✅ **Faster queries** with less noise
- ✅ **Lower storage costs** in Supabase

---

## Summary

We now track only what matters for recommendations:
- What boards users **view**
- What boards users **favorite**
- What users **search for**

All with just the essential data needed to build intelligent, personalized recommendations through RAG integration.
