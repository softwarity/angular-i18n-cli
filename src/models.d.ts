interface PackageJson {
  dependencies: {
    '@angular/core'?: string;
    [key: string]: string | undefined;
  };
}

interface AngularConfig {
  projects: {
    [key: string]: {
      i18n?: {
        sourceLocale: { code: string; subPath: string };
        locales: { [key: string]: { translation: string; subPath: string } };
      };
      architect?: {
        build?: {
          options?: {
            polyfills?: string[];
          };
          configurations?: {
            [key: string]: {
              localize?: string[];
              deleteOutputPath?: boolean;
            };
          };
        };
        'extract-i18n'?: {
          builder: string;
          options: {
            outputPath?: string;
            targetFiles?: string[];
            [key: string]: any;
          };
        };
      };
    };
  };
}