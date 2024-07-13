## Development setup recommendations

### How to start

Use `bun i`, `npm i`, `pnpm i` or `yarn` to install packages.

### Config of variables

- Use `.env` file to setup your own development environment
- Env vars with prefix `PUBLIC_` are widely used in `/src/utils/config.ts`

### Useful commands

run checks, fix styles, imports, formatting and autofixable linting errors:
```
bun run typecheck
bun run fix
```

## End-to-End (E2E) Tests

This directory contains end-to-end tests. These tests are written using [Playwright](https://playwright.dev/)

### Structure

- `/tests/*`: This directory contains the test files.
- `/playwright.config.ts`: This is the configuration file for Playwright.

### Getting Started

Follow these steps:

1. **Install dependencies**: Run `npm run e2e:install` to install the necessary dependencies for running the tests.

2. **Run the tests**: After using `npm run e2e:tests`.

### Additional Information

If workers is no needed use:
- `npx playwright test --project=webkit --workers 4`

For more information on how to write tests using Playwright - [Playwright documentation](https://playwright.dev/docs/intro).

### 🚀 Tests in CI Mode

Tests are executed within a GitHub workflow. We organize our tests into two main directories:

- `tests`: Contains tests that do not require authentication.
- `tests-with-auth`: Houses tests that interact with authenticated parts of the application.

🔧 **Configuration:**

Playwright is configured to utilize the `BASE_URL` environment variable. Ensure this is properly set in your CI configuration to point to the correct environment.

📝 **Note:**

After pages have been adjusted to work with authentication, all tests should be moved to the `tests` directory to streamline the testing process.
