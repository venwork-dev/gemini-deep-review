export interface ReviewIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'correctness' | 'performance' | 'maintainability' | 'best-practice';
  file: string;
  line?: number;
  title: string;
  description: string;
  reasoning: string;
  suggestion?: string;
  ruleId?: string;
}

export interface ReviewResult {
  issues: ReviewIssue[];
  summary: string;
  overallScore: number;
  thinkingTrace?: string;
  filesReviewed: string[];
  totalLines: number;
}

export type RuleType = 'principle' | 'requirement';

export interface Rule {
  id: string;
  title: string;
  type: RuleType; // principle = guidance for AI reasoning, requirement = strict enforcement
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  tags: string[];
  content: string;
}

export interface ReviewConfig {
  model: string;
  enableDeepThinking: boolean;
  maxTokens: number;
  temperature: number;
  apiKey?: string;
}

export interface FileToReview {
  path: string;
  content: string;
  language: string;
  linesChanged?: number[];
}
