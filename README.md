
## How to start  
```
npm install
npm start
```

## Useful commands  
run checks  
```
npm run check
```
type checking with watch
```
npm run typecheck:watch
```
fix styles, imports, formatting and autofixable linting errors:
```
npm run fix
npm run format
```

## Config of variables

- All vars are already in place and wroted in   
    ```
    /src/utils/config.ts
    ```

# End-to-End (E2E) Tests

This directory contains end-to-end tests. These tests are written using [Playwright](https://playwright.dev/)

## Structure

- `/tests/*`: This directory contains the test files.
- `/playwright.config.ts`: This is the configuration file for Playwright.

## Getting Started

Follow these steps:

1. **Install dependencies**: Run `pnpm e2e:install` to install the necessary dependencies for running the tests.

2. **Run the tests**: After using `pnpm e2e:tests`.

## Additional Information

For more information on how to write tests using Playwright - [Playwright documentation](https://playwright.dev/docs/intro).
