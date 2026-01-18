import chalk from 'chalk';
import { ReviewResult, ReviewIssue } from './types.js';

export class ResultFormatter {
  /**
   * Format and print review results to console
   */
  static printResults(result: ReviewResult): void {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold.cyan('📊 CODE REVIEW RESULTS'));
    console.log('='.repeat(60) + '\n');

    // Overall metrics
    console.log(chalk.bold('📁 Files Reviewed:'), result.filesReviewed.length);
    console.log(chalk.bold('📝 Total Lines:'), result.totalLines);
    console.log(chalk.bold('🐛 Issues Found:'), result.issues.length);
    console.log(chalk.bold('⭐ Overall Score:'), this.formatScore(result.overallScore));
    console.log();

    // Summary
    console.log(chalk.bold.underline('Summary:'));
    console.log(chalk.gray(result.summary));
    console.log();

    // Thinking trace (if available)
    if (result.thinkingTrace) {
      console.log(chalk.bold.underline('🤔 Reasoning Trace:'));
      console.log(chalk.dim(result.thinkingTrace));
      console.log();
    }

    // Separate rule-based from AI discoveries
    const ruleBased = result.issues.filter(i => i.ruleId);
    const aiDiscoveries = result.issues.filter(i => !i.ruleId);

    console.log(chalk.bold.yellow(`\n📋 RULE-BASED FINDINGS (${ruleBased.length})`));
    console.log(chalk.gray('Issues found by checking your team rules\n'));
    console.log('-'.repeat(60));

    if (ruleBased.length > 0) {
      const ruleGrouped = this.groupBySeverity(ruleBased);
      for (const severity of ['critical', 'high', 'medium', 'low'] as const) {
        const issues = ruleGrouped[severity];
        if (issues.length === 0) continue;

        console.log(this.getSeverityHeader(severity, issues.length));
        issues.forEach((issue, index) => {
          this.printIssue(issue, index + 1);
        });
      }
    } else {
      console.log(chalk.gray('   (No rule violations found)\n'));
    }

    console.log(chalk.bold.cyan(`\n🧠 AI-DISCOVERED ISSUES (${aiDiscoveries.length})`));
    console.log(chalk.gray('Issues found by Gemini\'s deep reasoning (NOT from your rules!)\n'));
    console.log('-'.repeat(60));

    if (aiDiscoveries.length > 0) {
      const aiGrouped = this.groupBySeverity(aiDiscoveries);
      for (const severity of ['critical', 'high', 'medium', 'low'] as const) {
        const issues = aiGrouped[severity];
        if (issues.length === 0) continue;

        console.log(this.getSeverityHeader(severity, issues.length));
        issues.forEach((issue, index) => {
          this.printIssue(issue, index + 1, true); // true = AI discovery
        });
      }
    } else {
      console.log(chalk.gray('   (No additional issues discovered)\n'));
    }

    // Files reviewed
    console.log(chalk.bold.underline('Files Reviewed:'));
    result.filesReviewed.forEach(file => {
      console.log(chalk.gray(`  • ${file}`));
    });
    console.log();

    console.log('='.repeat(60));
  }

  /**
   * Print a single issue
   */
  private static printIssue(issue: ReviewIssue, index: number, isAiDiscovery: boolean = false): void {
    const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;

    console.log();
    console.log(chalk.bold(`${index}. ${issue.title}`));
    console.log(chalk.cyan(`   📍 ${location}`));

    if (isAiDiscovery) {
      console.log(chalk.magenta(`   🤖 AI Discovery - Not from any rule!`));
    }

    console.log(chalk.gray(`   🏷️  [${issue.category}]${issue.ruleId ? ` Rule: ${issue.ruleId}` : ' (AI reasoning)'}`));
    console.log();
    console.log(chalk.white('   Description:'));
    console.log(chalk.gray(`   ${issue.description}`));
    console.log();
    console.log(chalk.white('   💭 Reasoning:'));
    console.log(chalk.dim(`   ${issue.reasoning}`));

    if (issue.suggestion) {
      console.log();
      console.log(chalk.green('   ✅ Suggestion:'));
      console.log(chalk.greenBright(`   ${issue.suggestion}`));
    }
  }

  /**
   * Group issues by severity
   */
  private static groupBySeverity(issues: ReviewIssue[]): Record<string, ReviewIssue[]> {
    return {
      critical: issues.filter(i => i.severity === 'critical'),
      high: issues.filter(i => i.severity === 'high'),
      medium: issues.filter(i => i.severity === 'medium'),
      low: issues.filter(i => i.severity === 'low'),
    };
  }

  /**
   * Get formatted severity header
   */
  private static getSeverityHeader(severity: string, count: number): string {
    const icon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    }[severity] || '⚪';

    const color = {
      critical: chalk.red,
      high: chalk.yellow,
      medium: chalk.blue,
      low: chalk.green,
    }[severity] || chalk.white;

    return `\n${icon} ${color.bold(severity.toUpperCase())} (${count})`;
  }

  /**
   * Format score with color
   */
  private static formatScore(score: number): string {
    if (score >= 90) return chalk.green.bold(`${score}/100 (Excellent)`);
    if (score >= 70) return chalk.blue.bold(`${score}/100 (Good)`);
    if (score >= 50) return chalk.yellow.bold(`${score}/100 (Fair)`);
    return chalk.red.bold(`${score}/100 (Needs Improvement)`);
  }

  /**
   * Print a simple summary (for quick feedback)
   */
  static printSummary(result: ReviewResult): void {
    const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
    const highCount = result.issues.filter(i => i.severity === 'high').length;

    console.log();
    console.log(chalk.bold('Review Complete:'));
    console.log(`  Score: ${this.formatScore(result.overallScore)}`);
    console.log(`  Issues: ${result.issues.length} total`);
    if (criticalCount > 0) {
      console.log(chalk.red.bold(`  ⚠️  ${criticalCount} critical issue(s) found!`));
    }
    if (highCount > 0) {
      console.log(chalk.yellow.bold(`  ⚠️  ${highCount} high-priority issue(s) found!`));
    }
    console.log();
  }
}
