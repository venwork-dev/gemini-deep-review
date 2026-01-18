# Troubleshooting Guide

## Error: "Failed to parse JSON response"

### Symptoms
```
Failed to parse JSON response: {
  "issues": [
    {
      "suggestion": "Use Promise.all to fetch data concurrently...
```

Response is truncated mid-JSON, causing parse errors.

### Root Cause
The model hit its **output token limit** before completing the JSON response.

### Why This Happens

All current Gemini models have the same output limit:

| Model | Max Output | Tier | Recommended |
|-------|------------|------|-------------|
| `gemini-2.5-flash-lite` | 65K tokens | Budget | ✅ Good |
| `gemini-2.5-flash` | 65K tokens | Balanced | ✅ Best for most |
| `gemini-2.5-pro` | 65K tokens | Premium | ✅ Best quality |
| `gemini-3-flash-preview` | 65K tokens | Balanced (Gen 3) | ✅ Latest features |
| `gemini-3-pro-preview` | 65K tokens | Premium (Gen 3) | ✅ Most intelligent |

### Solutions

#### Solution 1: Try a Different Model

All models have 65K output tokens, but quality differs:

```bash
# In .env file
GEMINI_MODEL=gemini-2.5-pro

# Or via CLI
gemini-review file.tsx --model=gemini-2.5-pro
```

**Model recommendations:**
1. `gemini-2.5-pro` - Best quality (stable)
2. `gemini-3-pro-preview` - Latest, most intelligent (Gen 3)
3. `gemini-2.5-flash` - Good balance (default)
4. `gemini-2.5-flash-lite` - Budget option

**Note:** Output truncation is extremely rare with 65K limit

#### Solution 2: Review Smaller Files

Break up large files or review fewer files at once:

```bash
# Instead of reviewing a 500-line file
gemini-review src/LargeComponent.tsx

# Split into smaller components first
```

#### Solution 3: Simplify Rules

Reduce the number or complexity of your custom rules in the `rules/` directory. Fewer rules = smaller prompt = more room for output.

#### Solution 4: Reduce maxTokens in Config

Lower the `maxTokens` setting to force more concise responses:

```typescript
// In src/cli.ts
const config: ReviewConfig = {
  maxTokens: 4096,  // Instead of 8192
  // ...
};
```

## Error: "Model hit output limit"

### Symptoms
```
❌ Response truncated: The model hit its output limit.

Current model: gemini-2.0-flash-lite
Finish reason: MAX_TOKENS
```

### Solution
This is caught automatically now! The error message tells you exactly what to do:

1. Use `gemini-2.5-pro` or `gemini-3-pro-preview`
2. Review fewer files
3. Simplify rules

**Note:** Very rare with 65K output tokens (all models)

## Model Recommendations

### For Production CI/CD
```bash
GEMINI_MODEL=gemini-2.5-pro
```
- Most reliable and stable
- Advanced thinking capabilities
- Best quality reviews

### For Fast Local Development
```bash
GEMINI_MODEL=gemini-2.5-flash
```
- Good balance of speed and quality
- Price-performance leader
- Our default choice

### For Latest Features
```bash
GEMINI_MODEL=gemini-3-pro-preview
```
- Gen 3 cutting edge
- Most intelligent model
- Preview (experimental)

## Debugging Tips

### 1. Check Model Configuration
```bash
# Current model is shown in output:
🧠 Using model: gemini-2.0-flash-exp
```

### 2. Enable Verbose Errors
When you get parse errors, the tool now shows:
- Response preview (first/last 250 chars)
- Likely causes
- Troubleshooting steps
- Current model name

### 3. Test with Smaller Files
```bash
# Test with a simple component first
gemini-review test-samples/PerfectComponent.tsx
```

If it works on small files but fails on large ones = token limit issue.

## Understanding Token Limits

### What are tokens?
Tokens are pieces of text. Roughly:
- 1 token ≈ 4 characters
- 1 token ≈ 0.75 words

### How limits work
Each API call has two limits:
1. **Input tokens** (prompt + code): 1M tokens (all models)
2. **Output tokens** (response): 65K tokens (all models)

When reviewing code:
```
Input:  Your code (500 lines) + Rules (200 lines) + Prompt = ~3K tokens
Output: Review issues + reasoning + suggestions = 2K-6K tokens (typical)
```

With 65K output limit, truncation is extremely rare. If it happens, review fewer files.

## Prevention

The tool now includes automatic protections:

### 1. Model Validation
Warns you upfront if model is unknown:
```
⚠️  Unknown model: gemini-old-model
   May have limited output capacity.
```

Shows tier info for known models:
```
⚖️ Using balanced tier model (65K output limit)
```

### 2. Response Truncation Detection
Catches when response was cut off:
```
❌ Response truncated: The model hit its output limit.
```

### 3. Better Error Messages
Shows exactly what went wrong and how to fix it.

## Still Having Issues?

1. **Check your `.env` file**
   ```bash
   cat .env
   # Should show: GEMINI_MODEL=gemini-1.5-pro
   ```

2. **Verify API key is valid**
   ```bash
   echo $GOOGLE_API_KEY
   ```

3. **Try the recommended model**
   ```bash
   gemini-review file.tsx --model=gemini-2.5-pro
   ```

4. **File an issue**
   If none of the above work, file an issue at:
   https://github.com/your-repo/issues
