import type { TestRunnerConfig } from '@storybook/test-runner'
import { checkA11y, injectAxe } from 'axe-playwright'

/*
 * See https://storybook.js.org/docs/react/writing-tests/test-runner#test-hook-api-experimental
 * to learn more about the test-runner hooks API.
 */
const a11yConfig: TestRunnerConfig = {
  async preRender(page) {
    await injectAxe(page)
  },
  async postRender(page) {
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    })
  }
}

module.exports = a11yConfig
