# Angular i18n CLI

<div align="center">
  <img src="https://www.softwarity.io/img/softwarity.svg" alt="Softwarity Logo" width="200"/>
  <br/>
  <p><b>By Softwarity</b></p>
</div>

A CLI tool to help manage Angular i18n configuration in your projects. This tool is designed to work in conjunction with Angular's built-in i18n mechanism, providing a simplified way to manage your internationalization configuration.

## Related Services

- [Softwarity.io](https://softwarity.io) - API Gateway based on Spring Gateway
- [XLIFF AI Translator](https://xliff.softwarity.io) - AI-powered translation tool for Angular applications

## Requirements

- Angular 19 or higher
- Node.js 18 or higher

## Installation

```bash
# Install globally
npm install -g @softwarity/angular-i18n-cli

# Or install in your project
npm install --save-dev @softwarity/angular-i18n-cli
```

## Prerequisites

Before using the CLI, you need to install the required dependencies:

```bash
# Install @angular/localize
# See: https://angular.dev/guide/i18n
ng add @angular/localize

# Install ng-extract-i18n-merge
# See: https://github.com/daniel-sc/ng-extract-i18n-merge#readme
ng add ng-extract-i18n-merge
```

## Integration with Angular i18n

This CLI tool is specifically designed to work with Angular's built-in i18n mechanism. It helps you:
- Configure the i18n settings in your `angular.json`
- Manage locale configurations
- Set up the correct format for XLF files
- Configure the build process for multiple locales

The tool assumes you are using Angular's standard i18n workflow with XLF files and the `@angular/localize` package.

## Commands

### Initialize i18n configuration (`init`)

Initializes the i18n configuration in your Angular project.

```bash
angular-i18n init
```

#### Project Selection
- If your workspace has only one project, it will be automatically selected
- If your workspace has multiple projects, you'll be prompted to select one

#### What it modifies in angular.json
1. Adds i18n configuration:
```json
{
  "projects": {
    "your-project": {
      "i18n": {
        "sourceLocale": {
          "code": "en",
          "subPath": "en"
        },
        "locales": {}
      }
    }
  }
}
```

2. Adds build configuration for the source locale:
```json
{
  "projects": {
    "your-project": {
      "architect": {
        "build": {
          "configurations": {
            "en": {
              "localize": ["en"],
              "deleteOutputPath": false
            }
          }
        }
      }
    }
  }
}
```

3. Configures extract-i18n format:
```json
{
  "projects": {
    "your-project": {
      "architect": {
        "extract-i18n": {
          "options": {
            "format": "xlf"
          }
        }
      }
    }
  }
}
```

### Add a new locale (`add`)

Adds a new locale to your project.

```bash
angular-i18n add
```

#### Project Selection
- If your workspace has only one project, it will be automatically selected
- If your workspace has multiple projects, you'll be prompted to select one

#### Locale Input
- You'll be prompted to enter a locale code (e.g., 'fr', 'es', 'de')
- The code will be validated using the Intl API

#### What it modifies in angular.json
1. Adds the locale to i18n configuration:
```json
{
  "projects": {
    "your-project": {
      "i18n": {
        "locales": {
          "fr": {
            "translation": "src/locale/messages.fr.xlf",
            "subPath": "fr"
          }
        }
      }
    }
  }
}
```

2. Adds build configuration for the new locale:
```json
{
  "projects": {
    "your-project": {
      "architect": {
        "build": {
          "configurations": {
            "fr": {
              "localize": ["fr"],
              "deleteOutputPath": false
            }
          }
        }
      }
    }
  }
}
```

3. Adds the locale file to extract-i18n target files:
```json
{
  "projects": {
    "your-project": {
      "architect": {
        "extract-i18n": {
          "options": {
            "targetFiles": ["messages.fr.xlf"]
          }
        }
      }
    }
  }
}
```

### Remove a locale (`remove`)

Removes a locale from your project.

```bash
angular-i18n remove
```

#### Project Selection
- If your workspace has only one project, it will be automatically selected
- If your workspace has multiple projects, you'll be prompted to select one

#### Locale Selection
- You'll be prompted to select a locale from the list of configured locales

#### What it modifies in angular.json
1. Removes the locale from i18n configuration
2. Removes the build configuration for the locale
3. Removes the locale file from extract-i18n target files

## Error Handling

The CLI includes several error checks:
- Verifies that @angular/localize is installed
- Verifies that ng-extract-i18n-merge is installed
- Validates locale codes using the Intl API
- Ensures i18n is initialized before adding or removing locales
- Ensures extract-i18n is configured before adding locales
