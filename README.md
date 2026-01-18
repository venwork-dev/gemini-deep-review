# Gemini Code Review

AI-powered code review tool using Google Gemini with deep reasoning for React and TypeScript projects.

## Why Not Just Use GitHub Copilot Code Review?

| Feature | GitHub Copilot | Gemini Code Review |
|---------|----------------|-------------------|
| **Custom Rules** | 70-80% consistency | 100% enforcement |
| **Deep Reasoning** | Surface-level checks | Deep architectural analysis |
| **Explainability** | Black box | Full reasoning traces |
| **Customization** | Limited to `.copilot-instructions.md` | Fully extensible rule system |
| **Focus** | Generic code issues | React/TypeScript specialist |
| **Cost Control** | Fixed quota limits | Pay-per-use, no artificial limits |
| **Enforcement** | Comments can be dismissed | Can block CI/CD |

## Features

### 🧠 AI-Powered Discovery (Not Just Pattern Matching)

**The Key Difference**: Unlike Copilot which checks against a fixed list, Gemini **discovers** issues using deep reasoning:

- **Finds issues beyond your rules**: Uses pre-trained knowledge to spot problems you didn't specify
- **Context-aware analysis**: Understands trade-offs, edge cases, and architectural implications
- **Reasoning traces**: Shows WHY something is wrong, not just WHAT
- **Scales with AI improvements**: Gets smarter as Gemini models improve

**Example**: You write a principle about "performance optimization." Gemini:
1. Uses that to guide its thinking
2. Applies its vast knowledge of React internals
3. Discovers specific issues like race conditions, memory leaks, unnecessary re-renders
4. Explains the reasoning behind each finding

### Additional Features

- 🎯 **React & TypeScript Focus**: Specialized for modern React + TS codebases
- 📋 **Two-Tier Rule System**: Principles for AI guidance + Requirements for strict enforcement
- 🔍 **Detailed Explanations**: Every issue includes deep reasoning and actionable suggestions
- 🎨 **Beautiful CLI**: Color-coded severity levels with clear formatting
- 🚀 **Fast & Cost-Effective**: ~$0.0005 per file review
- 🔧 **Fully Customizable**: Add your team's standards without code changes

## Phase 1: Single File Review

Current capabilities:
- ✅ Review individual React/TypeScript files
- ✅ Deep reasoning with Gemini 2.0
- ✅ Structured JSON output
- ✅ Beautiful CLI formatting
- ⏳ Git diff support (coming in Phase 2)
- ⏳ GitHub Action (coming in Phase 3)

## Installation

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Add your Google API key to .env
echo "GOOGLE_API_KEY=your_api_key_here" > .env
```

## Getting a Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use an existing one
4. Copy the key and add it to your `.env` file

## Usage

### Review a Single File

```bash
bun run review test-samples/UserProfile.tsx
```

Or with custom options:

```bash
# Use specific model
bun run dev test-samples/UserProfile.tsx -- --model gemini-2.0-flash-thinking-exp

# Filter rules by tags
bun run dev test-samples/UserProfile.tsx -- --tags react,hooks

# Disable deep thinking (faster but less thorough)
bun run dev test-samples/UserProfile.tsx -- --no-thinking
```

### Quick Test

We've included a sample file with intentional issues:

```bash
bun test
```

This will review `test-samples/UserProfile.tsx` which contains 7 intentional issues:
1. Async waterfall (sequential fetches)
2. Missing useEffect dependency
3. State update without functional form
4. No cleanup for event listener
5. Type assertion without validation
6. Expensive computation without useMemo
7. Stale closure in event handler

## Project Structure

```
gemini-code-review/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── gemini-reviewer.ts  # Gemini API integration
│   ├── rule-loader.ts      # Load and compile rules
│   ├── formatter.ts        # Pretty print results
│   └── types.ts            # TypeScript interfaces
├── rules/
│   ├── react/
│   │   ├── async-waterfall.md
│   │   └── hooks-best-practices.md
│   └── typescript/
│       └── type-safety.md
├── test-samples/
│   └── UserProfile.tsx     # Sample file with issues
├── package.json
├── tsconfig.json
└── README.md
```

## Rule System: Principles + Requirements

This tool uses a **hybrid approach** combining two types of rules:

### 1. Principles (Guiding AI Reasoning)

Principles provide **conceptual guidance** for Gemini to discover issues using its own expertise. They don't prescribe exact patterns—they guide thinking.

**Example**: Instead of "look for this exact code pattern", principles say "think about performance implications of async operations" and let Gemini discover issues.

```markdown
---
id: performance-principles
title: React Performance Principles
type: principle
impact: HIGH
category: performance
tags: [react, performance]
---

## Core Principle
Minimize unnecessary work: parallel operations, accurate dependencies, memoization when beneficial.

## Questions to Guide Review
- Are independent operations running sequentially?
- Do effects properly declare dependencies?
- Are expensive computations memoized appropriately?
```

### 2. Requirements (Strict Enforcement)

Requirements are **team-specific standards** that must always be followed. These are enforced strictly.

**Example**: "Never use `any` type" or "Always clean up useEffect subscriptions"

```markdown
---
id: team-standards
title: Team Code Standards
type: requirement
impact: HIGH
category: best-practice
tags: [team-standards]
---

## No `any` Type (STRICT)
❌ Never: `function foo(data: any)`
✅ Always: `function foo(data: unknown)` + type guards
```

### Why Both?

- **Principles**: Let Gemini discover issues you didn't think to specify. Uses AI's deep reasoning.
- **Requirements**: Enforce your team's non-negotiable standards. No exceptions.

**Result**: You get both **AI-powered discovery** AND **team-specific enforcement**.

## Adding Custom Rules

Create a markdown file in `rules/react/`, `rules/typescript/`, or `rules/team/`:

```markdown
---
id: your-rule-id
title: Your Rule Title
type: principle  # or 'requirement'
impact: HIGH     # LOW | MEDIUM | HIGH | CRITICAL
category: performance
tags: [react, custom]
---

## Your content here
For principles: Provide conceptual guidance and questions
For requirements: State exact standards to enforce
```

The rule will be automatically loaded and used in reviews.

## Configuration

Environment variables (`.env`):

```bash
# Required
GOOGLE_API_KEY=your_key_here

# Optional
GEMINI_MODEL=gemini-2.0-flash-exp
ENABLE_DEEP_THINKING=true
MAX_TOKENS=8192
TEMPERATURE=0.1
```

### Available Models

- `gemini-2.0-flash-exp` (default) - Fast, cost-effective
- `gemini-2.0-flash-thinking-exp` - Deep reasoning enabled
- `gemini-1.5-pro` - More capable, slower, more expensive

## Output Format

The CLI outputs:
- 📊 Overall metrics (files, lines, issues, score)
- 📝 Summary of code quality
- 🔴 Critical issues (will cause bugs/crashes)
- 🟠 High priority issues (major problems)
- 🟡 Medium issues (code smells)
- 🟢 Low issues (minor improvements)

Each issue includes:
- **Location**: File and line number
- **Description**: What's wrong
- **Reasoning**: Why it's a problem (deep analysis)
- **Suggestion**: How to fix it

## Exit Codes

- `0` - Review passed (no critical/high issues)
- `1` - Review failed (critical issues found)

## Roadmap

### Phase 1: Single File Review ✅ (Current)
- [x] Gemini integration
- [x] Rule system
- [x] CLI interface
- [x] Pretty output
- [x] Test sample

### Phase 2: Git Diff Support (Next)
- [ ] Detect current branch
- [ ] Compare with base branch
- [ ] Review only changed files
- [ ] Show diff context
- [ ] Smart chunking for large PRs

### Phase 3: GitHub Action
- [ ] Action workflow file
- [ ] PR comment integration
- [ ] Inline annotations
- [ ] Blocking on critical issues
- [ ] Cost reporting

### Phase 4: Advanced Features
- [ ] Auto-fix suggestions (executable)
- [ ] Code execution validation
- [ ] Multi-model comparison
- [ ] Custom rule testing
- [ ] Web dashboard

## Cost Estimation

Gemini 2.0 Flash pricing (as of Jan 2025):
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

Typical review (500 LOC file):
- Input: ~3,000 tokens (rules + code)
- Output: ~1,000 tokens (review)
- **Cost: ~$0.0005 per file** (less than a penny!)

## Comparison with Alternatives

| Tool | Cost per Review | Customization | React Focus | Deep Reasoning |
|------|----------------|---------------|-------------|----------------|
| GitHub Copilot | Quota-based | Low | No | No |
| This Tool | ~$0.0005 | High | Yes | Yes |
| Human Review | $50-200 | High | Depends | Yes |

## Development

```bash
# Run in dev mode
bun run dev test-samples/UserProfile.tsx

# Build
bun run build

# Run built version
node dist/cli.js test-samples/UserProfile.tsx
```

## Troubleshooting

### "GOOGLE_API_KEY is required"
Make sure you've created a `.env` file with your API key.

### "Rules directory not found"
Make sure you're running the command from the project root directory.

### "Failed to parse JSON response"
Try using a different model or reducing the file size. Sometimes the model output is malformed.

## Contributing

This is a showcase project.
Contributions welcome!

1. Fork the repo
2. Create a feature branch
3. Add your changes
4. Submit a pull request

## License

MIT

## Credits

Inspired by:
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
- [Anthropic Agent SDK](https://github.com/anthropics/claude-agent-sdk)
- Google Gemini 2.0 capabilities
