import chalk from 'chalk';
import Table from 'cli-table3';
import terminalLink from 'terminal-link';
import figures from 'figures';
import { ReviewResult, ReviewIssue } from './types.js';

export class ResultFormatter {
  /**
   * Format and print review results to console
   */
  static printResults(result: ReviewResult): void {
    console.log(); // Spacing

    // Header - simpler approach to avoid rendering issues
    console.log(chalk.bold.cyan('═'.repeat(65)));
    console.log();
    console.log(chalk.bold.white('        🔍 Gemini Deep Code Review'));
    console.log();
    console.log(chalk.bold.cyan('═'.repeat(65)));

    console.log();

    // Results summary
    console.log(chalk.green(figures.tick) + ' ' + chalk.bold('Review Complete'));
    console.log();

    // Results table
    console.log(chalk.bold('Results'));
    const resultsTable = new Table({
      chars: {
        top: '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        bottom: '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        left: '  ',
        'left-mid': '',
        mid: '',
        'mid-mid': '',
        right: '',
        'right-mid': '',
        middle: ' ',
      },
      style: { 'padding-left': 0, 'padding-right': 2 },
      colWidths: [20, 50],
    });

    const scoreDisplay = this.formatScore(result.overallScore);
    const issuesCount = result.issues.length;
    const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
    const highCount = result.issues.filter(i => i.severity === 'high').length;
    const mediumCount = result.issues.filter(i => i.severity === 'medium').length;
    const lowCount = result.issues.filter(i => i.severity === 'low').length;

    resultsTable.push(
      [chalk.dim('Score'), scoreDisplay],
      [chalk.dim('Files'), chalk.whiteBright(result.filesReviewed.length.toString())],
      [chalk.dim('Issues'), chalk.whiteBright(issuesCount.toString())]
    );

    console.log(resultsTable.toString());
    console.log();

    // Summary
    if (result.summary) {
      console.log(chalk.bold('Summary'));
      console.log(chalk.dim('  ' + result.summary));
      console.log();
    }

    // Separate rule-based from AI discoveries
    const ruleBased = result.issues.filter(i => i.ruleId);
    const aiDiscoveries = result.issues.filter(i => !i.ruleId);
    const totalIssues = result.issues.length;

    // Main issues header with breakdown
    console.log(chalk.bold(`📊 Issues Found (${totalIssues})`));
    console.log()

    console.log(chalk.bold(`🔖 From Team Rules (${ruleBased.length})`));
    console.log(chalk.bold(`✨ AI Insights: ${aiDiscoveries.length})`));

    console.log();

    if (ruleBased.length > 0) {
      const ruleGrouped = this.groupBySeverity(ruleBased);
      for (const severity of ['critical', 'high', 'medium', 'low'] as const) {
        const issues = ruleGrouped[severity];
        if (issues.length === 0) continue;

        console.log(this.getSeverityHeader(severity, issues.length));
        console.log();
        issues.forEach((issue, index) => {
          this.printIssue(issue, false); // false = not AI discovery
        });
      }
    } else {
      console.log(chalk.dim('  No rule violations found'));
      console.log();
    }

    // AI Insights
    console.log(chalk.bold(`✨ AI Insights (${aiDiscoveries.length})`));
    console.log();

    if (aiDiscoveries.length > 0) {
      const aiGrouped = this.groupBySeverity(aiDiscoveries);
      for (const severity of ['critical', 'high', 'medium', 'low'] as const) {
        const issues = aiGrouped[severity];
        if (issues.length === 0) continue;

        console.log(this.getSeverityHeader(severity, issues.length));
        console.log();
        issues.forEach((issue, index) => {
          this.printIssue(issue, true); // true = AI discovery
        });
      }
    } else {
      console.log(chalk.dim('  No additional issues discovered'));
      console.log();
    }

    // Footer
    console.log(
      chalk.dim(
        figures.tick + ' Done in ' + ((Date.now() - (result as any).startTime) / 1000 || 0).toFixed(1) + 's'
      )
    );
    console.log();
  }

  /**
   * Print a single issue with modern formatting
   */
  private static printIssue(issue: ReviewIssue, isAiDiscovery: boolean): void {
    const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;

    // Make file path clickable if supported
    const fileLink = terminalLink(location, `file://${process.cwd()}/${issue.file}`, {
      fallback: () => location,
    });

    // Issue box - using plain text to avoid box rendering issues
    console.log(chalk.bold(issue.title));
    console.log(chalk.blueBright(figures.pointer + ' ') + chalk.dim(fileLink));
    console.log();
    console.log(issue.description);

    if (issue.reasoning) {
      console.log();
      console.log(chalk.blueBright(figures.arrowRight + ' Why:'));
      console.log(chalk.dim(issue.reasoning));
    }

    if (issue.suggestion) {
      console.log();
      console.log(chalk.green(figures.tick + ' Fix:'));
      console.log(chalk.greenBright(issue.suggestion));
    }

    if (issue.ruleId) {
      console.log();
      console.log(chalk.yellow(figures.info + ' Rule: ') + issue.ruleId);
    } else if (isAiDiscovery) {
      console.log();
      console.log(chalk.magenta(figures.star + ' AI Insight'));
    }

    // Separator line
    console.log(chalk.dim('─'.repeat(70)));
    console.log();
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
      critical: figures.cross,
      high: figures.warning,
      medium: figures.info,
      low: figures.bullet,
    }[severity] || figures.bullet;

    // Use brighter colors that work in both light and dark themes
    const color = {
      critical: chalk.redBright,
      high: chalk.yellowBright,
      medium: chalk.blueBright,
      low: chalk.greenBright,
    }[severity] || chalk.white;

    return `  ${color.bold(icon + ' ' + severity.toUpperCase())} ${chalk.dim('(' + count + ')')}`;
  }

  /**
   * Get severity color for borders
   */
  private static getSeverityColor(severity: string): 'red' | 'yellow' | 'blue' | 'green' | 'white' {
    return {
      critical: 'red',
      high: 'yellow',
      medium: 'blue',
      low: 'green',
    }[severity] as any || 'white';
  }

  /**
   * Format score with color
   */
  private static formatScore(score: number): string {
    if (score >= 90) return chalk.green.bold(`${score}/100 `) + chalk.green('(Excellent ' + figures.tick + ')');
    if (score >= 70) return chalk.blue.bold(`${score}/100 `) + chalk.blue('(Good ' + figures.tick + ')');
    if (score >= 50) return chalk.yellow.bold(`${score}/100 `) + chalk.yellow('(Fair)');
    return chalk.red.bold(`${score}/100 `) + chalk.red('(Needs Improvement)');
  }

  /**
   * Print configuration table
   */
  static printConfig(config: {
    model: string;
    rules: number;
    tags: string[];
    deepThinking: boolean;
  }): void {
    console.log(chalk.bold('Configuration'));

    const configTable = new Table({
      chars: {
        top: '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        bottom: '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        left: '  ',
        'left-mid': '',
        mid: '',
        'mid-mid': '',
        right: '',
        'right-mid': '',
        middle: ' ',
      },
      style: { 'padding-left': 0, 'padding-right': 2 },
      colWidths: [20, 50],
    });

    configTable.push(
      [chalk.dim('Model'), chalk.whiteBright(config.model)],
      [chalk.dim('Rules'), chalk.whiteBright(`${config.rules} loaded (${config.tags.join(', ')})`)],
      [
        chalk.dim('Deep Mode'),
        config.deepThinking
          ? chalk.greenBright('enabled ' + figures.tick)
          : chalk.dim('disabled'),
      ]
    );

    console.log(configTable.toString());
    console.log();
  }
}
