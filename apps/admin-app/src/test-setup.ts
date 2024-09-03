// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};

declare global {
  interface Window {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
  }
}

window.SUPABASE_URL = 'https://yourapp.supabase.co';
window.SUPABASE_KEY = 'your-public';

import 'jest-preset-angular/setup-jest';
