# Gemini Deep Code Review

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
- 🎨 **Beautiful CLI**: Color-coded severity levels with modern terminal UI
- 🚀 **Fast & Scalable**: ~$0.003 per file review, enterprise-ready
- 🔧 **Fully Customizable**: Add your team's standards without code changes

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

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use an existing one
4. Copy the key and add it to your `.env` file

**Note**: Free tier is perfect for personal projects. For enterprise/team usage, consider upgrading to [Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/pricing) for higher rate limits.

## Usage

### Review a Single File

```bash
bun run review test-samples/UserProfile.tsx
```

Or with custom options:

```bash
# Use specific model
bun run dev test-samples/UserProfile.tsx -- --model gemini-2.5-pro

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

This will review `test-samples/UserProfile.tsx` which contains 7 intentional issues including async waterfall, missing dependencies, and type safety problems.

## Model Selection

The tool supports multiple Gemini models with different trade-offs:

```bash
# Budget - Fast and cost-efficient
GEMINI_MODEL=gemini-2.5-flash-lite

# Balanced - Good quality (default)
GEMINI_MODEL=gemini-2.5-flash

# Premium - Best quality
GEMINI_MODEL=gemini-2.5-pro

# Latest Gen 3 - Cutting edge (experimental)
GEMINI_MODEL=gemini-3-pro-preview
```

See [MODEL_SELECTION.md](./MODEL_SELECTION.md) for detailed comparison and recommendations. Model capabilities and limits are guidelines - actual performance may vary.

## Project Structure

```
gemini-deep-review/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── gemini-reviewer.ts  # Gemini API integration
│   ├── rule-loader.ts      # Load and compile rules
│   ├── formatter.ts        # Pretty print results
│   └── types.ts            # TypeScript interfaces
├── rules/
│   ├── react/              # React-specific rules
│   │   ├── async-waterfall.md
│   │   └── hooks-best-practices.md
│   └── typescript/         # TypeScript rules
│       └── type-safety.md
├── test-samples/           # Sample files for testing
└── docs/                   # Additional documentation
    ├── MODEL_SELECTION.md
    ├── TROUBLESHOOTING.md
    └── RATE_LIMITS.md
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

# Optional (with defaults)
GEMINI_MODEL=gemini-2.5-flash
ENABLE_DEEP_THINKING=true
MAX_TOKENS=8192
TEMPERATURE=0.1
```

## Output Format

The CLI outputs:

- 📊 Overall metrics (files, score, issue count)
- 📝 Summary of code quality
- 🔖 **From Team Rules**: Issues matching your custom rules
- ✨ **AI Insights**: Additional issues discovered by AI reasoning

Each issue includes:
- **Location**: File and line number (clickable in supported terminals)
- **Title**: Short description
- **Description**: What's wrong
- **Why**: Deep reasoning explaining the problem
- **Fix**: Actionable suggestion to resolve it

Severity levels:
- 🔴 **Critical**: Will cause bugs/crashes
- 🟠 **High**: Major problems
- 🟡 **Medium**: Code smells
- 🟢 **Low**: Minor improvements

## Exit Codes

- `0` - Review passed (no critical issues)
- `1` - Review failed (critical issues found)

Use in CI/CD to block merges on critical issues.

## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

Quick fixes:
- **"GOOGLE_API_KEY is required"**: Create a `.env` file with your API key
- **"Rules directory not found"**: Run from project root directory
- **JSON parse errors**: See TROUBLESHOOTING.md for model recommendations

## Roadmap

### Phase 1: Single File Review ✅ (Current)
- [x] Gemini integration with deep reasoning
- [x] Hybrid rule system (principles + requirements)
- [x] Modern CLI interface
- [x] Comprehensive error handling

### Phase 2: Git Diff Support (Next)
- [ ] Review only changed files in PR/branch
- [ ] Show diff context in reviews
- [ ] Smart chunking for large PRs

### Phase 3: GitHub Action
- [ ] PR comment integration
- [ ] Inline code annotations
- [ ] Blocking on critical issues
- [ ] Cost reporting

### Phase 4: Advanced Features
- [ ] Auto-fix suggestions (executable)
- [ ] Multi-file architectural analysis
- [ ] Custom rule testing framework
- [ ] Web dashboard for team analytics

## Cost & Scalability

**Personal/Small Teams (Free Tier)**:
- 15 reviews/minute, 1,500/day
- Perfect for individual developers
- ~$0.003 per review

**Enterprise (Paid Tier)**:
- 1,000+ reviews/minute
- No daily limits
- Scales to thousands of developers
- ~$225/month for 2,500 reviews/day (negligible vs. engineer costs)

See [RATE_LIMITS.md](./RATE_LIMITS.md) for detailed analysis.

## Legal & Fair Use

### Copyright Policy

This tool is designed to analyze code that you own or have permission to review. Users are responsible for ensuring they have appropriate rights to any code submitted for review.

### Fair Use Notice

This tool:
- Analyzes code for quality, bugs, and best practices (transformative use)
- Does not store, redistribute, or create derivative works from reviewed code
- Processes code transiently through Google's Gemini API
- Returns original analysis and suggestions, not code reproduction

Users should:
- Only review code they own or have authorization to analyze
- Not use this tool to reverse-engineer proprietary software
- Comply with their organization's policies on code review tools
- Be aware that code is processed by Google's AI services (see [Google's terms](https://ai.google.dev/gemini-api/terms))

### Data Privacy

- Code is sent to Google Gemini API for analysis
- Google's data usage policies apply (review at [ai.google.dev/terms](https://ai.google.dev/gemini-api/terms))
- No code is stored by this tool itself
- For sensitive codebases, consider using Google Cloud with private endpoints

### Disclaimer

THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. The tool provides suggestions and analysis but does not guarantee code correctness or security. Users are responsible for reviewing and validating all suggestions before implementation.

## Development

```bash
# Run in dev mode
bun run dev test-samples/UserProfile.tsx

# Build
bun run build

# Run tests
bun test
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Credits

- Powered by [Google Gemini](https://ai.google.dev/gemini-api/docs)
- Inspired by [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
- Built with [Anthropic's Agent patterns](https://github.com/anthropics/claude-agent-sdk)

## Support

- 📖 [Documentation](./MODEL_SELECTION.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

---

**Note**: Model capabilities, rate limits, and pricing are subject to change by Google. Refer to [official documentation](https://ai.google.dev/gemini-api/docs) for the latest information.
