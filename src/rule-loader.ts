import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import matter from 'gray-matter';
import { Rule } from './types.js';

export class RuleLoader {
  private rulesDir: string;
  private rules: Rule[] = [];

  constructor(rulesDir: string) {
    this.rulesDir = rulesDir;
  }

  /**
   * Load all rule files from the rules directory
   */
  loadRules(): Rule[] {
    this.rules = [];
    this.scanDirectory(this.rulesDir);
    console.log(`✓ Loaded ${this.rules.length} rules`);
    return this.rules;
  }

  /**
   * Recursively scan directory for .md rule files
   */
  private scanDirectory(dir: string): void {
    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (stat.isFile() && extname(entry) === '.md') {
          this.loadRuleFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dir}:`, error);
    }
  }

  /**
   * Load and parse a single rule file
   */
  private loadRuleFile(filePath: string): void {
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      if (!data.id || !data.title) {
        console.warn(`Skipping ${filePath}: missing required frontmatter (id, title)`);
        return;
      }

      const rule: Rule = {
        id: data.id,
        title: data.title,
        type: data.type || 'principle', // Default to principle for flexibility
        impact: data.impact || 'MEDIUM',
        category: data.category || 'general',
        tags: data.tags || [],
        content: content.trim()
      };

      this.rules.push(rule);
    } catch (error) {
      console.warn(`Warning: Could not load rule ${filePath}:`, error);
    }
  }

  /**
   * Get rules filtered by tags
   */
  getRulesByTags(tags: string[]): Rule[] {
    return this.rules.filter(rule =>
      tags.some(tag => rule.tags.includes(tag))
    );
  }

  /**
   * Compile all rules into a single prompt-ready string
   * Separates principles from requirements for better AI reasoning
   */
  compileRulesForPrompt(tags?: string[]): string {
    const rulesToUse = tags ? this.getRulesByTags(tags) : this.rules;

    if (rulesToUse.length === 0) {
      return 'No specific rules loaded. Use general React and TypeScript best practices.';
    }

    const principles = rulesToUse.filter(r => r.type === 'principle');
    const requirements = rulesToUse.filter(r => r.type === 'requirement');

    let output = '';

    // Principles section - guides AI reasoning
    if (principles.length > 0) {
      output += `
# GUIDING PRINCIPLES (Use these to guide your deep thinking)

These principles should inform your analysis. Use your expertise to discover
issues related to these concepts. Think deeply and reason about implications.

`;
      principles.forEach(rule => {
        output += `
## ${rule.title}
**Focus Area:** ${rule.category} | **Priority:** ${rule.impact}

${rule.content}

---
`;
      });
    }

    // Requirements section - strict enforcement
    if (requirements.length > 0) {
      output += `
# STRICT REQUIREMENTS (Always enforce these)

These are team-specific standards that MUST be followed. Flag any violations.

`;
      requirements.forEach(rule => {
        output += `
## ${rule.title}
**Rule ID:** ${rule.id} | **Priority:** ${rule.impact}

${rule.content}

---
`;
      });
    }

    return output;
  }

  /**
   * Get all loaded rules
   */
  getRules(): Rule[] {
    return this.rules;
  }
}
