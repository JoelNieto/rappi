// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};

declare global {
  interface Window {
    process: {
      env: {
        SUPABASE_URL: string;
        SUPABASE_KEY: string;
        SUPABASE_SERVICE_ROLE: string;
      };
    };
  }
}

window.process.env.SUPABASE_URL = 'https://yourapp.supabase.co';
window.process.env.SUPABASE_KEY = 'your-public';
window.process.env.SUPABASE_SERVICE_ROLE = 'your-service-role';

import 'jest-preset-angular/setup-jest';
