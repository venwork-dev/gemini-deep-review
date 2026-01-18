# Gemini Model Selection Guide

**Source:** https://ai.google.dev/gemini-api/docs/models (as of January 2026)

## Quick Recommendation by Use Case

### 💰 Budget Tier - Free/Personal Projects
**Recommended:** `gemini-2.5-flash-lite`

```bash
# In .env
GEMINI_MODEL=gemini-2.5-flash-lite

# Or via CLI
gemini-review file.tsx --model=gemini-2.5-flash-lite
```

**Best for:**
- Personal projects
- Learning / experimentation
- Small codebases
- Fast reviews with tight budgets

**Features:**
- 65K output tokens (plenty for code reviews)
- Ultra fast response times
- Most cost-efficient option
- 1M context window

### ⚖️ Balanced Tier - Most Users
**Recommended:** `gemini-2.5-flash` (default) or `gemini-3-flash-preview`

```bash
# In .env
GEMINI_MODEL=gemini-2.5-flash

# Or via CLI
gemini-review file.tsx --model=gemini-2.5-flash
```

**Best for:**
- Team projects
- Medium-sized codebases
- CI/CD pipelines (moderate usage)
- Good balance of speed, cost, and quality

**Why it's default:**
- Price-performance leader
- Fast (similar to lite models)
- Reliable (65K output tokens)
- Good quality reviews
- Stable (not experimental)

**Alternative: gemini-3-flash-preview**
- Latest generation (Gen 3)
- Balanced for speed and scale
- Preview model (cutting edge features)

### ⭐ Premium Tier - Production/Enterprise
**Recommended:** `gemini-2.5-pro` or `gemini-3-pro-preview`

```bash
# In .env
GEMINI_MODEL=gemini-2.5-pro

# Or via CLI
gemini-review file.tsx --model=gemini-2.5-pro
```

**Best for:**
- Production CI/CD
- Large codebases
- Critical code reviews
- Complex architectural analysis
- Best quality needed

**Features:**
- 65K output tokens (same as others)
- Advanced thinking capabilities
- Most capable reasoning
- Best quality reviews

**Latest: gemini-3-pro-preview**
- Most intelligent model (Gen 3)
- Preview model with cutting-edge features
- Same 65K output, better reasoning

## All Available Models

| Model | Tier | Generation | Output Tokens | Context Window | Best For |
|-------|------|------------|---------------|----------------|----------|
| `gemini-2.5-flash-lite` | Budget | 2.5 | 65K | 1M | Small projects, experimentation |
| `gemini-2.5-flash` | Balanced | 2.5 | 65K | 1M | **Most users (default)** |
| `gemini-2.5-pro` | Premium | 2.5 | 65K | 1M | Production, best quality |
| `gemini-3-flash-preview` | Balanced | 3 | 65K | 1M | Latest fast model (preview) |
| `gemini-3-pro-preview` | Premium | 3 | 65K | 1M | Latest intelligent model (preview) |

## Model Comparison

### Speed
```
Fastest:  gemini-2.5-flash-lite
Fast:     gemini-2.5-flash, gemini-3-flash-preview
Slower:   gemini-2.5-pro, gemini-3-pro-preview
```

### Quality
```
Best:     gemini-3-pro-preview, gemini-2.5-pro
Good:     gemini-3-flash-preview, gemini-2.5-flash
Decent:   gemini-2.5-flash-lite
```

### Cost (Paid Tier)
```
Cheapest: gemini-2.5-flash-lite
Cheap:    gemini-2.5-flash, gemini-3-flash-preview
Higher:   gemini-2.5-pro, gemini-3-pro-preview
```

### Generation (Latest Features)
```
Gen 3:    gemini-3-pro-preview, gemini-3-flash-preview (cutting edge)
Gen 2.5:  gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite (stable)
```

## Choosing Your Model

### Question 1: What's your budget?
- **Free tier only** → `gemini-2.5-flash` (balanced) or `gemini-2.5-flash-lite` (budget)
- **Paid tier, cost-conscious** → `gemini-2.5-flash`
- **Paid tier, quality matters** → `gemini-2.5-pro` or `gemini-3-pro-preview`

### Question 2: Do you need latest features?
- **Cutting edge** → `gemini-3-pro-preview` or `gemini-3-flash-preview` (Gen 3)
- **Stable production** → `gemini-2.5-pro` or `gemini-2.5-flash` (Gen 2.5)

### Question 3: What matters most?
- **Speed** → `gemini-2.5-flash-lite`
- **Quality** → `gemini-2.5-pro` or `gemini-3-pro-preview`
- **Balance** → `gemini-2.5-flash` ⭐ (our default)
- **Latest features** → `gemini-3-flash-preview` or `gemini-3-pro-preview`

## CI/CD Integration

### For Small Teams (< 10 devs)
```bash
# .github/workflows/code-review.yml
GEMINI_MODEL=gemini-2.5-flash  # Balanced performance
```

### For Large Teams (10+ devs)
```bash
# Option 1: Use Pro (best quality)
GEMINI_MODEL=gemini-2.5-pro

# Option 2: Use latest Gen 3 (cutting edge)
GEMINI_MODEL=gemini-3-flash-preview
```

### For High-Volume CI/CD
Consider:
1. Paid tier with higher rate limits
2. Queue reviews to avoid hitting limits
3. Review only changed files (not entire codebase)
4. Use webhook triggers instead of polling

## Upgrading Models

### When to Upgrade from Lite → Flash
- ✅ Reviews are inconsistent
- ✅ Missing obvious issues
- ✅ Not cost-sensitive
- ✅ Need better quality

### When to Upgrade from Flash → Pro
- ✅ Need best quality reviews
- ✅ Complex architectural analysis
- ✅ Production-critical code
- ✅ Can afford premium pricing

### When to Try Gen 3 Preview Models
- ✅ Want cutting-edge capabilities
- ✅ Testing latest features
- ✅ Willing to use preview/experimental models
- ❌ Don't use for: Stable production environments

### When NOT to Upgrade
- ❌ Current model works fine
- ❌ Cost is primary concern
- ❌ Speed more important than quality

## Testing Different Models

```bash
# Test budget model
gemini-review file.tsx --model=gemini-2.5-flash-lite

# Test balanced model (default)
gemini-review file.tsx --model=gemini-2.5-flash

# Test premium model
gemini-review file.tsx --model=gemini-2.5-pro

# Test latest Gen 3
gemini-review file.tsx --model=gemini-3-pro-preview

# Compare results
diff <(gemini-review file.tsx --model=gemini-2.5-flash) \
     <(gemini-review file.tsx --model=gemini-2.5-pro)
```

## Understanding Output Limits

### All Models Have Same Output Limit
- **65,536 tokens** (65K) output limit for ALL models
- This is ~50,000 words or ~200 pages of text
- More than enough for any code review response

### Previous Generation Issues
- Older models (Gemini 1.x) had smaller limits (2K-8K tokens)
- **All current models (2.5+) have 65K output** - no truncation issues!

### If You Still Hit Limits
Very unlikely with 65K, but if it happens:
1. Review fewer files at once
2. Simplify your custom rules
3. All models have same limit, so switching won't help

## Environment Variable Setup

### Option 1: Global (in ~/.bashrc or ~/.zshrc)
```bash
export GEMINI_MODEL=gemini-2.5-flash
```

### Option 2: Per Project (in .env)
```bash
# .env
GEMINI_MODEL=gemini-2.5-flash
```

### Option 3: Per Command (CLI flag)
```bash
gemini-review file.tsx --model=gemini-2.5-pro
```

### Priority Order
```
CLI flag > .env file > Environment variable > Default (gemini-2.5-flash)
```

## Recommendations Summary

**90% of users should use:** `gemini-2.5-flash` ⭐
- Good quality
- Fast enough
- Price-performance leader
- Stable and reliable
- **This is our default**

**Budget users should use:** `gemini-2.5-flash-lite`
- Ultra fast
- Most cost-efficient
- Still has 65K output (no truncation)

**10% should consider:**
- `gemini-2.5-pro` - If quality is critical
- `gemini-3-pro-preview` - If you want cutting edge Gen 3 features

## Rate Limits

**Note:** Google doesn't publish specific free tier rate limits in documentation.
- View your active limits at: https://aistudio.google.com/usage
- Rate limits vary by account tier and usage
- All models share your account's rate limits

**If you hit rate limits:**
1. Wait and retry (automatic in most cases)
2. Reduce review frequency
3. Upgrade to paid tier for higher limits
4. Batch reviews instead of real-time

## Future-Proofing

Models evolve frequently. Check latest at:
- https://ai.google.dev/gemini-api/docs/models
- https://aistudio.google.com/usage

Our tool will warn if using unknown/deprecated models:
```
⚠️  Unknown model: gemini-old-model
   May have limited output capacity.
```

## Preview vs Stable Models

### Stable Models (Recommended for Production)
- `gemini-2.5-flash-lite`
- `gemini-2.5-flash`
- `gemini-2.5-pro`

**Characteristics:**
- Stable API
- No breaking changes
- Reliable for CI/CD
- Production-ready

### Preview Models (Experimental)
- `gemini-3-flash-preview`
- `gemini-3-pro-preview`

**Characteristics:**
- Cutting-edge features
- May have API changes
- Latest capabilities
- Best for testing/development

**When to use preview:**
- Testing new features
- Development environments
- Willing to handle potential changes

**When NOT to use preview:**
- Stable production pipelines
- CI/CD that needs consistency
- Enterprise deployments
