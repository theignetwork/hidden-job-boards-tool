# Deployment Troubleshooting

## Expected Build Output

When deploying to Netlify, the build logs should show:

```
✓ Generating static pages (1004/1004)
● /board/[id] (SSG) - 1000+ paths
✅ Build verification passed!
```

## Common Issues

### Issue: "No boards fetched from Supabase"

**Cause:** Environment variables not set on Netlify

**Fix:**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Verify these exist:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://rtkqwupaavdkmoqisulv.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[the anon key]`
3. Clear cache and redeploy

### Issue: "Build verification failed - 0 board pages"

**Cause:** `generateStaticParams()` returned empty array

**Fix:**
1. Check Netlify build logs for errors
2. Verify Supabase connection during build
3. Check if database query is timing out

### Issue: Board pages work locally but 404 on production

**Cause:** Old deployment cached or build didn't include new changes

**Fix:**
1. Clear Netlify cache: Site Settings → Build & Deploy → Clear cache
2. Trigger new deploy: Deploys → Clear cache and deploy site
3. Wait for "Build verification passed!" message

## Verification After Deploy

Test these URLs should return 200 OK:
- https://hidden-job-boards-tool.netlify.app
- https://hidden-job-boards-tool.netlify.app/board/38d1e7e7-3b49-46cf-8bce-da78bb22551b

If any return 404, the deployment failed.
