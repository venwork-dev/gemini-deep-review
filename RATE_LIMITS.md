# Understanding Gemini Rate Limits

## Two Types of Limits

### 1. Request Rate Limits (RPM/TPM)
How many requests you can make per minute.

**Free Tier (AI Studio):**
- 15 requests per minute (RPM)
- 1 million tokens per minute (TPM)
- 1,500 requests per day (RPD)

**Paid Tier (Cloud):**
- 1,000+ RPM (varies by model)
- 4 million+ TPM
- No daily limit

**Impact on Tool:**
- Not usually a problem for code reviews
- One file = one request
- You'd need to review 15+ files/minute to hit limits

### 2. Output Token Limits (Per Request)
Maximum response size for a single request.

| Model | Max Output | Impact |
|-------|-----------|---------|
| gemini-2.5-flash-lite | 65K tokens | ✅ Excellent |
| gemini-2.5-flash | 65K tokens | ✅ Excellent |
| gemini-2.5-pro | 65K tokens | ✅ Excellent |
| gemini-3-flash-preview | 65K tokens | ✅ Excellent (Gen 3) |
| gemini-3-pro-preview | 65K tokens | ✅ Excellent (Gen 3) |

**Note:** All current Gemini models (2.5+) have 65K output tokens - more than enough for any code review!

**Impact on Tool:**
- With 65K output tokens, truncation is extremely rare
- Previous generation models (1.x) had smaller limits (2K-8K)
- Current models eliminate the "Failed to parse JSON" errors from truncation
- Our tool still validates responses for safety

## Why We Don't Fetch Rate Limits Dynamically

### Reasons:
1. **Most users don't have access**
   - Requires Google Cloud project
   - AI Studio keys (free tier) don't support quota API
   - Would fail for majority of users

2. **Not the actual problem**
   - Rate limits (RPM) rarely hit during code reviews
   - Output limits (tokens/response) cause most errors
   - Output limits don't change - safe to hardcode

3. **Adds unnecessary complexity**
   - Extra API call on startup
   - Requires `googleapis` dependency
   - Needs special permissions
   - Slower startup time

4. **Static limits are sufficient**
   - Model output capacities rarely change
   - We can update when new models release
   - Simpler and more reliable

## How This Tool Handles Limits

### 1. Proactive Warnings
```
⚠️  Unknown model: gemini-old-model
   May have limited output capacity.
```

For known models, shows tier info:
```
⚖️ Using balanced tier model (65K output limit)
```

### 2. Truncation Detection
```typescript
if (finishReason === 'MAX_TOKENS') {
  throw helpful error with solutions
}
```

### 3. JSON Validation
```typescript
if (!text.endsWith('}')) {
  warn about truncation
}
```

### 4. Helpful Error Messages
Shows:
- What went wrong
- Why it happened
- How to fix it (use different model, etc.)

## When Rate Limits Matter

### Scenario 1: Batch Processing
Reviewing 100+ files rapidly:
```bash
for file in src/**/*.tsx; do
  gemini-review $file
done
```

**Solution:** Add delay between requests
```bash
for file in src/**/*.tsx; do
  gemini-review $file
  sleep 4  # Wait 4 seconds (15 RPM = 1 per 4s)
done
```

### Scenario 2: CI/CD Pipeline
Multiple PRs triggering reviews simultaneously.

**Solution:** Use queue or paid tier

### Scenario 3: Large Team
10+ developers using shared API key.

**Solution:** Use separate Cloud projects or paid tier

## Monitoring Rate Limits (Optional)

If you're on Google Cloud and want to monitor quotas:

### Prerequisites
- Google Cloud Project (not AI Studio)
- Service Usage API enabled
- `serviceusage.services.get` permission

### Code
```typescript
import { google } from 'googleapis';

async function checkQuotas() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const serviceUsage = google.serviceusage({ version: 'v1', auth });

  const response = await serviceUsage.projects.services.consumerQuotaMetrics.list({
    parent: `projects/YOUR_PROJECT_ID/services/generativelanguage.googleapis.com`
  });

  return response.data.metrics;
}
```

### When to Use
- Production deployments at scale
- Paid Cloud tier
- Multiple teams sharing quotas
- Need to alert before hitting limits

## Recommended Approach

### For Most Users (Current Implementation)
✅ Static model limits + validation
✅ Clear error messages
✅ Works for everyone
✅ No extra dependencies

### For Enterprise (Future)
Consider adding dynamic quota checking if:
- Using Google Cloud (not AI Studio)
- Processing high volumes
- Need quota alerting
- Have multiple teams

## Summary

**Current approach is correct:**
1. Static output limits (what causes errors)
2. Runtime validation (catch truncation)
3. Helpful error messages (guide users)

**Don't add dynamic quota fetching unless:**
- Users frequently hit rate limits (they don't)
- Tool is deployed at enterprise scale
- Using Google Cloud exclusively

The complexity isn't worth it for the current use case.
