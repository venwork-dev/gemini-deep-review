import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { ReviewConfig, ReviewResult, FileToReview, ReviewIssue } from './types.js';

export class GeminiReviewer {
  private genai: GoogleGenerativeAI;
  private config: ReviewConfig;

  constructor(config: ReviewConfig) {
    if (!config.apiKey) {
      throw new Error('Google API key is required. Set GOOGLE_API_KEY environment variable.');
    }
    this.genai = new GoogleGenerativeAI(config.apiKey);
    this.config = config;
  }

  /**
   * Review code files with deep reasoning
   */
  async reviewCode(
    files: FileToReview[],
    rulesPrompt: string
  ): Promise<ReviewResult> {
    const prompt = this.buildPrompt(files, rulesPrompt);

    const model = this.genai.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        responseMimeType: 'application/json',
        responseSchema: this.getResponseSchema(),
      },
      systemInstruction: this.getSystemInstruction(),
    });

    console.log(`🧠 Using model: ${this.config.model}`);
    console.log(`🤔 Deep thinking: ${this.config.enableDeepThinking ? 'enabled' : 'disabled'}`);

    const startTime = Date.now();

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`⏱️  Analysis completed in ${duration}s`);

      const response = result.response;
      const text = response.text();

      let reviewData;
      try {
        reviewData = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', text);
        throw new Error('Invalid JSON response from Gemini');
      }

      // Extract thinking trace if available
      const thinkingTrace = this.extractThinkingTrace(response);

      const reviewResult: ReviewResult = {
        issues: reviewData.issues || [],
        summary: reviewData.summary || 'No summary provided',
        overallScore: reviewData.overallScore || 0,
        thinkingTrace,
        filesReviewed: files.map(f => f.path),
        totalLines: files.reduce((sum, f) => sum + f.content.split('\n').length, 0),
      };

      return reviewResult;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to review code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the review prompt
   */
  private buildPrompt(files: FileToReview[], rulesPrompt: string): string {
    const filesSection = files.map(file => {
      return `
### File: ${file.path}
\`\`\`${file.language}
${file.content}
\`\`\`
`;
    }).join('\n');

    return `
# Code Review Task

You are an expert code reviewer with deep expertise in React and TypeScript.

## Your Approach

You have TWO sources of knowledge to apply:

### 1. Team's Custom Rules (Below)
These represent the team's specific standards and focus areas. Use these to:
- **PRINCIPLES**: Guide your thinking and help you discover related issues
- **REQUIREMENTS**: Strictly enforce these team standards

### 2. Your Own Expertise (Pre-trained Knowledge)
Beyond the custom rules, use your extensive knowledge to discover:
- Subtle bugs and logic errors
- Security vulnerabilities
- Performance optimization opportunities
- Architectural improvements
- React/TypeScript anti-patterns not explicitly mentioned
- Edge cases and error handling gaps
- Accessibility concerns
- Maintainability issues

**CRITICAL**: Don't limit yourself to only what's in the rules! The rules are guidance,
not constraints. Use your reasoning to find issues the team may not have thought to specify.

---

${rulesPrompt}

---

**REMEMBER**: When reporting issues, if the issue matches one of the rules above:
- Async waterfall, missing dependencies, expensive computations → "react-performance-principles"
- Type assertions, any usage, null handling → "typescript-type-safety-principles"
- No effect cleanup, functional state updates, no any type → "team-strict-requirements"

Include the rule ID so the team knows it was a rule-based finding!

---

## Code to Review

${filesSection}

## Review Instructions

### Step 1: Deep Reasoning
Before flagging issues, THINK about:
- What could go wrong with this code in production?
- Are there hidden bugs or race conditions?
- What happens under edge cases (null, undefined, empty arrays, slow network)?
- How does this scale? What if there are 1000 items instead of 10?
- Is this code maintainable? Will future developers understand it?
- Are there security implications?
- What performance bottlenecks exist?

### Step 2: Issue Discovery
Find issues in TWO categories:

**A) Rule-Based Issues**
- Check compliance with REQUIREMENTS (strict enforcement)
- Use PRINCIPLES to guide discovery of related problems

**B) Independent Discoveries**
- Use your expertise to find issues NOT covered by rules
- Think about implications the team may not have considered
- Consider architecture, scalability, edge cases

### Step 3: Reporting
For each issue:
- **File & Line**: Be specific
- **Severity**: critical | high | medium | low
  - critical: Will break in production (crashes, data loss, security holes)
  - high: Major bugs, serious performance issues, bad practices
  - medium: Code smells, minor issues, maintainability concerns
  - low: Minor improvements, suggestions
- **Category**: correctness | performance | maintainability | best-practice
- **Title**: Short, clear description (max 100 chars)
- **Description**: What's wrong? (max 300 chars)
- **Reasoning**: WHY is this a problem? Use your deep reasoning here! (max 400 chars)
- **Suggestion**: How to fix it? Be concise and actionable. (max 300 chars)
- **Rule ID**: IMPORTANT!
  - If the issue is DIRECTLY covered by a PRINCIPLE or REQUIREMENT rule above, include the rule ID
  - Example: Async waterfall → "react-performance-principles"
  - Example: Missing useEffect dependency → "react-performance-principles"
  - Example: Type assertion without validation → "typescript-type-safety-principles"
  - Example: No cleanup for effects → "team-strict-requirements"
  - If it's NOT explicitly covered by any rule above, set to null (this makes it an AI discovery)

### Step 4: Overall Assessment
- **Score** (0-100): Holistic quality score
- **Summary**: 2-3 sentences on overall code quality, major concerns, and strengths

## What to IGNORE
- Formatting/style (semicolons, spaces, quotes)
- TypeScript compilation errors (assume handled separately)
- Missing imports (assume they exist)

## What to FOCUS ON
- Logic and correctness
- Architecture and patterns
- Performance implications
- Security concerns
- Maintainability and scalability
- React/TypeScript best practices
- Edge cases and error handling

## Output Format

Return valid JSON matching the schema with:
- Array of issues (both rule-based AND your independent discoveries)
- Overall summary
- Quality score
`;
  }

  /**
   * Get the system instruction for Gemini
   */
  private getSystemInstruction(): string {
    return `You are an expert code reviewer with 10+ years of experience in React and TypeScript.

Your strengths:
- Deep understanding of React hooks, lifecycle, and performance optimization
- Expert-level TypeScript knowledge including advanced types and patterns
- Strong architectural sense for maintainable, scalable code
- Security-conscious and performance-focused
- Clear, actionable communication

Your approach:
- Think deeply about code implications before flagging issues
- Consider context and trade-offs, not just rules
- Be specific and helpful in suggestions
- Focus on high-impact issues over nitpicks
- Explain WHY something is a problem, not just WHAT is wrong
- BE CONCISE: Keep all fields brief and actionable (no rambling!)

CRITICAL: Output only valid JSON matching the provided schema. No additional text.
Keep suggestions SHORT and actionable - aim for 1-3 sentences maximum per field.`;
  }

  /**
   * Define the JSON response schema for structured output
   */
  private getResponseSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        issues: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              severity: {
                type: SchemaType.STRING,
                enum: ['low', 'medium', 'high', 'critical'],
              },
              category: {
                type: SchemaType.STRING,
                enum: ['correctness', 'performance', 'maintainability', 'best-practice'],
              },
              file: { type: SchemaType.STRING },
              line: { type: SchemaType.NUMBER, nullable: true },
              title: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              reasoning: { type: SchemaType.STRING },
              suggestion: {
                type: SchemaType.STRING,
                nullable: true,
                // Limit suggestion length to prevent token overflow
                maxLength: 500
              },
              ruleId: { type: SchemaType.STRING, nullable: true },
            },
            required: ['severity', 'category', 'file', 'title', 'description', 'reasoning'],
          },
        },
        summary: { type: SchemaType.STRING },
        overallScore: { type: SchemaType.NUMBER },
      },
      required: ['issues', 'summary', 'overallScore'],
    };
  }

  /**
   * Extract thinking trace from response metadata
   */
  private extractThinkingTrace(response: any): string | undefined {
    try {
      // Gemini thinking mode exposes reasoning in metadata
      // This is a placeholder - actual implementation depends on API version
      if (response.candidates?.[0]?.content?.parts) {
        const thinkingParts = response.candidates[0].content.parts.filter(
          (part: any) => part.thought || part.thinking
        );
        if (thinkingParts.length > 0) {
          return thinkingParts.map((p: any) => p.thought || p.thinking).join('\n');
        }
      }
    } catch (error) {
      // Thinking trace not available
    }
    return undefined;
  }
}
