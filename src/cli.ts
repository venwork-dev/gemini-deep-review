#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { RuleLoader } from './rule-loader.js';
import { GeminiReviewer } from './gemini-reviewer.js';
import { ResultFormatter } from './formatter.js';
import { FileToReview, ReviewConfig } from './types.js';

const program = new Command();

program
  .name('gemini-review')
  .description('AI-powered code review using Google Gemini with deep reasoning')
  .version('0.1.0')
  .argument('[file]', 'File to review (default: will support git diff in future)')
  .option('-m, --model <model>', 'Gemini model to use', process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite')
  .option('--no-thinking', 'Disable deep thinking mode')
  .option('-t, --tags <tags>', 'Filter rules by tags (comma-separated)', '')
  .action(async (filePath: string | undefined, options) => {
    try {
      console.log(chalk.bold.cyan('\n🔍 Gemini Code Review\n'));

      // Validate API key
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        console.error(chalk.red('❌ Error: GOOGLE_API_KEY environment variable is required'));
        console.log(chalk.yellow('\nSet it with: export GOOGLE_API_KEY=your_api_key_here'));
        console.log(chalk.gray('Or create a .env file (see .env.example)\n'));
        process.exit(1);
      }

      // Load rules
      const spinner = ora('Loading review rules...').start();
      const rulesDir = resolve(process.cwd(), 'rules');

      if (!existsSync(rulesDir)) {
        spinner.fail(chalk.red(`Rules directory not found: ${rulesDir}`));
        process.exit(1);
      }

      const ruleLoader = new RuleLoader(rulesDir);
      ruleLoader.loadRules();
      spinner.succeed(chalk.green(`Loaded ${ruleLoader.getRules().length} rules`));

      // Parse tags
      const tags = options.tags
        ? options.tags.split(',').map((t: string) => t.trim())
        : ['react', 'typescript'];

      const rulesPrompt = ruleLoader.compileRulesForPrompt(tags);
      console.log(chalk.gray(`Using rules tagged: ${tags.join(', ')}`));

      // Determine files to review
      let filesToReview: FileToReview[];

      if (filePath) {
        // Single file mode
        filesToReview = await loadSingleFile(filePath);
      } else {
        // Future: git diff mode
        console.error(chalk.red('❌ Error: File path required in Phase 1'));
        console.log(chalk.yellow('Usage: gemini-review <file-path>'));
        console.log(chalk.gray('Example: gemini-review src/components/UserProfile.tsx\n'));
        process.exit(1);
      }

      console.log(chalk.gray(`Reviewing ${filesToReview.length} file(s)...\n`));

      // Configure reviewer
      const config: ReviewConfig = {
        model: options.model,
        enableDeepThinking: options.thinking,
        maxTokens: 8192,
        temperature: 0.1,
        apiKey,
      };

      // Run review with visible two-phase process
      console.log(chalk.bold.cyan('🤖 AI Review Process\n'));

      console.log(chalk.yellow('📋 JOB 1: Checking against your team rules...'));
      console.log(chalk.gray('   - Enforcing strict requirements'));
      console.log(chalk.gray('   - Applying guiding principles\n'));

      const reviewSpinner = ora({
        text: chalk.blue('🧠 JOB 2: Deep AI reasoning (discovering issues beyond rules)...'),
        color: 'blue'
      }).start();

      const reviewer = new GeminiReviewer(config);

      try {
        const result = await reviewer.reviewCode(filesToReview, rulesPrompt);
        reviewSpinner.succeed(chalk.green('✅ Analysis complete! (Both rule-based + AI discoveries)'));

        // Print results
        ResultFormatter.printResults(result);

        // Exit code based on severity
        const hasCritical = result.issues.some(i => i.severity === 'critical');
        const hasHigh = result.issues.some(i => i.severity === 'high');

        if (hasCritical) {
          console.log(chalk.red.bold('❌ Review failed: Critical issues found\n'));
          process.exit(1);
        } else if (hasHigh) {
          console.log(chalk.yellow.bold('⚠️  Review passed with warnings: High-priority issues found\n'));
          process.exit(0);
        } else {
          console.log(chalk.green.bold('✅ Review passed!\n'));
          process.exit(0);
        }
      } catch (error) {
        reviewSpinner.fail(chalk.red('Analysis failed'));
        throw error;
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * Load a single file for review
 */
async function loadSingleFile(filePath: string): Promise<FileToReview[]> {
  const resolvedPath = resolve(process.cwd(), filePath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = readFileSync(resolvedPath, 'utf-8');
  const ext = extname(filePath);

  // Map file extensions to languages
  const languageMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
  };

  const language = languageMap[ext] || 'typescript';

  return [
    {
      path: filePath,
      content,
      language,
    },
  ];
}

program.parse();
