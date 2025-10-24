# Hidden Job Boards Tool - Code Investigation & Diagnosis

## Project Context

**Repository**: https://github.com/theignetwork/hidden-job-boards-tool
**Live Site**: https://hidden-job-boards-tool.netlify.app
**Framework**: Next.js with static export
**Database**: Supabase
**Deployment**: Netlify

## Reported Problem

The application has an issue where:
1. **Job board list** loads correctly from Supabase `hidden_job_boards` table
2. **Individual board details** show blank screens when clicked
3. Console shows 404 errors for missing `.txt` files
4. Hypothesis: The code tries to load static files at `/hidden-job-boards/{slug}.txt` instead of fetching from Supabase

## Your Mission: Investigate & Diagnose

**Goal**: Analyze the codebase to verify the diagnosis and document exactly what's happening, why it's happening, and what needs to be fixed.

---

## Investigation Steps

### Step 1: Clone and Set Up the Project

```bash
# Clone the repository
git clone https://github.com/theignetwork/hidden-job-boards-tool.git
cd hidden-job-boards-tool

# Install dependencies
npm install

# Set up environment variables (create .env.local)
echo "NEXT_PUBLIC_SUPABASE_URL=https://rtkqwupaavdkmoqisulv.supabase.co" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0a3F3dXBhYXZka21vcWlzdWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NTAwOTIsImV4cCI6MjA1NzIyNjA5Mn0.i0XcaPKDd3YuMK_Phb-XwOu8DvkLuUN--Ub7O8PutMk" >> .env.local

# Try running the dev server
npm run dev
```

### Step 2: Map Out the Project Structure

**Explore the directory structure:**

```bash
# View the overall structure
ls -la

# Find all page/route files
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | grep -E "(pages|app|src)" | head -30

# Check if there's a public directory with .txt files
ls -la public/ 2>/dev/null
ls -la public/hidden-job-boards/ 2>/dev/null

# Check the Next.js configuration
cat next.config.js 2>/dev/null || cat next.config.mjs 2>/dev/null
```

**Document your findings:**
- What folder structure is being used? (`pages/` or `app/` directory)
- Is there a `public/hidden-job-boards/` folder with `.txt` files?
- What's in `next.config.js`? (Look for `output: 'export'`)

### Step 3: Locate the Board Listing Page

**Find where the board list is rendered:**

```bash
# Search for Supabase queries
grep -r "from('hidden_job_boards')" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx"

# Search for common listing page patterns
find . -name "index.js" -o -name "index.tsx" -o -name "page.js" -o -name "page.tsx" | grep -v node_modules

# Look for component names
grep -r "BoardList\|JobBoard" --include="*.js" --include="*.tsx" --include="*.jsx"
```

**Open and review the main listing page:**
- How is it fetching data from Supabase?
- What columns is it selecting?
- How are boards displayed (cards, list, grid)?
- What happens when a user clicks on a board?

### Step 4: Locate the Board Detail Page

**Find the individual board page:**

```bash
# Look for dynamic routes
find . -path "*/pages/board/*" -o -path "*/app/board/*" | grep -v node_modules

# Common patterns for dynamic routes in Next.js
find . -name "[id].js" -o -name "[slug].js" -o -name "[id].tsx" -o -name "[slug].tsx" | grep -v node_modules

# Search for potential detail page components
grep -r "BoardDetail\|board.*detail" --include="*.js" --include="*.tsx" -i
```

**Open the board detail page and analyze:**
- What's the file path? (e.g., `pages/board/[slug].js`)
- How is it trying to get board data?
- **CRITICAL**: Look for any of these patterns:
  ```javascript
  fetch(`/hidden-job-boards/${slug}.txt`)
  fetch(`/hidden-job-boards/${id}.txt`)
  readFileSync
  fs.promises.readFile
  ```

### Step 5: Find the Supabase Client Setup

```bash
# Find Supabase client initialization
grep -r "createClient" --include="*.js" --include="*.ts"

# Look for lib or utils folder
ls -la lib/ 2>/dev/null
ls -la utils/ 2>/dev/null

# Find Supabase config
find . -name "*supabase*" | grep -v node_modules
```

**Review the Supabase setup:**
- Where is the client initialized?
- Are there any helper functions for querying boards?
- Are environment variables being used correctly?

### Step 6: Trace the Bug - Find the .txt File Fetch

**This is the critical step - find WHERE the code tries to load .txt files:**

```bash
# Search for .txt references
grep -rn "\.txt" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" | grep -v node_modules

# Search for fetch calls
grep -rn "fetch(" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" | grep -v node_modules

# Search for file system operations
grep -rn "readFile\|readFileSync" --include="*.js" --include="*.ts" | grep -v node_modules
```

**When you find the problematic code, document:**
- Exact file path and line number
- What the code is doing
- Why it's failing (can't find .txt files for new boards)
- How the error is handled (or not handled)

### Step 7: Test the Issue Locally

**Try to reproduce the problem:**

```bash
# Start the dev server
npm run dev
```

**In your browser:**
1. Go to `http://localhost:3000`
2. Open browser DevTools → Network tab
3. Click on a job board
4. Watch for:
   - 404 errors in the Network tab
   - Console errors
   - The blank screen behavior

**Take notes:**
- Which requests succeed?
- Which fail (404)?
- What's the exact URL pattern for failed requests?
- Are there any JavaScript errors in the console?

### Step 8: Examine the Supabase Table Schema

**Create a test script to see what data exists:**

Create `test-supabase.js` in the project root:

```javascript
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function inspectDatabase() {
  console.log('Fetching sample record from hidden_job_boards...\n')
  
  const { data, error } = await supabase
    .from('hidden_job_boards')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Sample record:')
  console.log(JSON.stringify(data[0], null, 2))
  
  console.log('\n\nAvailable columns:')
  console.log(Object.keys(data[0]))
  
  // Count total records
  const { count } = await supabase
    .from('hidden_job_boards')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n\nTotal boards in database: ${count}`)
}

inspectDatabase()
```

Run it:
```bash
node test-supabase.js
```

**Document the schema:**
- What columns exist?
- Does `board_summary` exist?
- Does `usage_tips` exist?
- What's the primary key? (`id`, `slug`, or both?)

---

## Deliverable: Diagnostic Report

Create a file called `DIAGNOSIS.md` with the following sections:

### 1. Confirmed Architecture

**Current data flow:**
- [Describe how the board list loads]
- [Describe how board details are supposed to load]
- [Diagram if helpful]

### 2. Root Cause Verification

**Is the diagnosis correct?**
- Yes/No: Does the code try to load .txt files?
- File location: [exact file path and line number]
- Code snippet: [paste the problematic code]

### 3. Static Files Investigation

- How many .txt files exist in `public/hidden-job-boards/`?
- What's the naming pattern?
- Which boards work vs which don't?

### 4. Supabase Integration Status

**What's working:**
- [List what currently uses Supabase correctly]

**What's broken:**
- [List what tries to use .txt files instead]

### 5. Database Schema

**Confirmed columns in `hidden_job_boards` table:**
```
- id: [type]
- name: [type]
- slug: [type]
- board_summary: [exists? type?]
- usage_tips: [exists? type?]
- [other columns]
```

### 6. Error Analysis

**404 Errors:**
- Pattern: [exact URL pattern that 404s]
- Frequency: [how often does this happen?]
- Impact: [what breaks as a result?]

### 7. Recommendations for Fix

**Short-term workaround (if needed):**
- [What needs to happen to make it work NOW]

**Long-term solution:**
- [What should be refactored]
- [Why this approach is better]
- [Estimated complexity]

---

## Important Notes

- Don't make any changes to the code yet - this is investigation only
- Document everything you find with file paths and line numbers
- If something doesn't match the hypothesis, note it
- Take screenshots of errors if helpful
- The goal is to have a complete understanding before proposing solutions

Once you complete this investigation, provide your `DIAGNOSIS.md` report back to the user.