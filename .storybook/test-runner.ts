import type { Page } from '@playwright/test'
import type { TestRunnerConfig } from '@storybook/test-runner'
import { checkA11y, injectAxe } from 'axe-playwright'

/*
 * See https://storybook.js.org/docs/react/writing-tests/test-runner#test-hook-api-experimental
 * to learn more about the test-runner hooks API.
 */
const a11yConfig = {
  async preRender(page: Page) {
    await injectAxe(page)
  },
  async postRender(page: Page) {
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    })
  }
} as TestRunnerConfig

module.exports = a11yConfig
