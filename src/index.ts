#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

async function checkAngularVersion(): Promise<void> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found in current directory');
  }

  const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const angularVersion = packageJson.dependencies?.['@angular/core'];
  
  if (!angularVersion) {
    throw new Error('Angular is not installed in this project');
  }

  const version = parseInt(angularVersion.replace(/[^0-9]/g, ''));
  if (version < 19) {
    throw new Error(`This CLI requires Angular 19 or higher. Current version: ${angularVersion}`);
  }
}

async function readAngularConfig(): Promise<AngularConfig> {
  await checkAngularVersion();
  const configPath = path.join(process.cwd(), 'angular.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('angular.json not found in current directory');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

async function writeAngularConfig(config: AngularConfig): Promise<void> {
  const configPath = path.join(process.cwd(), 'angular.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

async function selectProject(config: AngularConfig): Promise<string> {
  const projects = Object.keys(config.projects);
  if (projects.length === 1) return projects[0];

  const { project } = await inquirer.prompt([
    {
      type: 'list',
      name: 'project',
      message: 'Select a project:',
      choices: projects
    }
  ]);
  return project;
}

program.name('angular-i18n').description('CLI for managing Angular i18n configuration');

program.command('init').description('Initialize i18n configuration').action(async () => {
  try {
    const config = await readAngularConfig();
    const project = await selectProject(config);

    // Check for @angular/localize
    const hasLocalize = config.projects[project].architect?.build?.options?.polyfills?.includes('@angular/localize/init');
    if (!hasLocalize) {
      console.log(chalk.yellow('@angular/localize is not configured.'));
      console.log(chalk.yellow('Please run the following commands:'));
      console.log(chalk.cyan('ng add @angular/localize'));
      console.log(chalk.cyan('ng add ng-extract-i18n-merge'));
      console.log(chalk.yellow('Then run this command again.'));
      process.exit(1);
    }

    // Check for extract-i18n
    const hasExtractI18n = config.projects[project].architect?.['extract-i18n'];
    if (!hasExtractI18n) {
      console.log(chalk.yellow('ng-extract-i18n-merge is not configured.'));
      console.log(chalk.yellow('Please run the following command:'));
      console.log(chalk.cyan('ng add ng-extract-i18n-merge'));
      console.log(chalk.yellow('Then run this command again.'));
      process.exit(1);
    }

    // Configure extract-i18n format
    config.projects[project].architect!['extract-i18n']!.options = {
      ...config.projects[project].architect!['extract-i18n']!.options,
      format: 'xlf'
    };
    
    const { sourceLocale } = await inquirer.prompt([
      {
        type: 'input',
        name: 'sourceLocale',
        message: 'Enter source locale code (default: en):',
        default: 'en'
      }
    ]);

    if (!config.projects[project].i18n) {
      config.projects[project].i18n = { sourceLocale: { code: sourceLocale, subPath: sourceLocale }, locales: {} };
    }

    if (!config.projects[project].architect?.build?.configurations) {
      config.projects[project].architect = {
        ...config.projects[project].architect,
        build: {
          ...config.projects[project].architect?.build,
          configurations: {}
        }
      };
    }

    config.projects[project].architect!.build!.configurations![sourceLocale] = { localize: [sourceLocale], deleteOutputPath: false };

    await writeAngularConfig(config);
    console.log(chalk.green('i18n configuration initialized successfully!'));
  } catch (error) {
    console.error(chalk.red('Error:'), error);
  }
});
program.command('add').description('Add a new locale').action(async () => {
  try {
    const config = await readAngularConfig();
    const project = await selectProject(config);

    const { localeCode } = await inquirer.prompt([
      {
        type: 'input',
        name: 'localeCode',
        message: 'Enter locale code (BCP 47)  (e.g., fr):',
        validate: (input) => {
          try {
            const displayName = new Intl.DisplayNames(['en'], { type: 'language' });
            return displayName.of(input) != input;
          } catch {
            return `Please enter a valid locale code. ${input} is not a valid BCP 47 tags. See https://angular.dev/guide/i18n/locale-id for reference.`;
          }
        }
      }
    ]);

    if (!config.projects[project].i18n) {
      throw new Error('i18n not initialized. Run init-i18n first.');
    }
    const outputPath = config.projects[project].architect!['extract-i18n']!.options?.outputPath || 'src/locales';
    config.projects[project].i18n!.locales[localeCode] = { translation: `${outputPath}/messages.${localeCode}.xlf`, subPath: localeCode };

    if (!config.projects[project].architect?.build?.configurations) {
      config.projects[project].architect = {
        ...config.projects[project].architect,
        build: {
          ...config.projects[project].architect?.build,
          configurations: {}
        }
      };
    }

    config.projects[project].architect!.build!.configurations![localeCode] = { localize: [localeCode], deleteOutputPath: false };

    // Check if extract-i18n is configured
    if (!config.projects[project].architect?.['extract-i18n']) {
      throw new Error('extract-i18n not configured. Please run init command first.');
    }

    if (!config.projects[project].architect!['extract-i18n']!.options?.targetFiles) {
      config.projects[project].architect!['extract-i18n']!.options = {
        ...config.projects[project].architect!['extract-i18n']!.options,
        targetFiles: []
      };
    }

    config.projects[project].architect!['extract-i18n']!.options!.targetFiles!.push(`messages.${localeCode}.xlf`);

    await writeAngularConfig(config);
    console.log(chalk.green(`Locale ${localeCode} added successfully!`));
  } catch (error) {
    console.error(chalk.red('Error:'), error);
  }
});

program.command('remove').description('Remove a locale').action(async () => {
  try {
    const config = await readAngularConfig();
    const project = await selectProject(config);

    const availableLocales = Object.keys(config.projects[project].i18n?.locales || {});
    if (availableLocales.length === 0) {
      throw new Error('No locales configured');
    }

    const { localeCode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'localeCode',
        message: 'Select locale to remove:',
        choices: availableLocales
      }
    ]);

    if (config.projects[project].i18n?.locales) {
      delete config.projects[project].i18n!.locales[localeCode];
    }

    if (config.projects[project].architect?.build?.configurations) {
      delete config.projects[project].architect!.build!.configurations![localeCode];
    }

    // Remove from targetFiles
    if (config.projects[project].architect?.['extract-i18n']?.options?.targetFiles) {
      const targetFiles = config.projects[project].architect!['extract-i18n']!.options!.targetFiles!;
      const index = targetFiles.indexOf(`messages.${localeCode}.xlf`);
      if (index > -1) {
        targetFiles.splice(index, 1);
      }
    }

    await writeAngularConfig(config);
    console.log(chalk.green(`Locale ${localeCode} removed successfully!`));
  } catch (error) {
    console.error(chalk.red('Error:'), error);
  }
});

program.parse(); 