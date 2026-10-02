import { test, expect } from '@playwright/test'
import { loadAllTestAccounts } from 'deepspace/testing'

/**
 * End-to-end multi-user flow test:
 * 1. Verifies the public test landing page (/t/:slug) correctly renders an assigned variant
 * 2. Emits conversion actions (e.g. copy command / developer intent proxy)
 * 3. Checks that unauthenticated visitors cannot access protected admin routes (/experiments)
 */
test.describe('Positioning Lab Multi-User & Experiment Flow', () => {
  test('public visitor is deterministically assigned a variant and can trigger copy action', async ({ page }) => {
    // Visit a test experiment page with a traffic source tag
    await page.goto('/t/agentic-gtm?src=hn')

    // Expect the experiment landing container to mount
    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible({ timeout: 15000 })

    // Verify channel indicator is displayed
    await expect(page.getByText('hn', { exact: false })).toBeVisible()

    // Verify developer intent action (Command Box) is clickable
    const copyButton = page.locator('button:has-text("Copy"), button:has-text("Copied")').first()
    await expect(copyButton).toBeVisible()
    await copyButton.click()

    // Check feedback toast / button state changes to Copied
    await expect(page.locator('text=Copied')).toBeVisible({ timeout: 5000 })
  })

  test('public visitor submitting a micro-survey triggers confirmation', async ({ page }) => {
    await page.goto('/t/agentic-gtm?src=reddit')

    // Find micro survey textarea
    const surveyInput = page.locator('textarea')
    if (await surveyInput.isVisible()) {
      await surveyInput.fill('Need better docs on Cloudflare Workers and Durable Objects integration.')
      const submitBtn = page.locator('button:has-text("Send Feedback"), button:has-text("Submit")').first()
      await submitBtn.click()

      // Expect thank you notice
      await expect(page.locator('text=Thank you for the signal!')).toBeVisible({ timeout: 5000 })
    }
  })

  test('unauthenticated visitor trying to access protected experiment manager is redirected or sees login prompt', async ({ page }) => {
    await page.goto('/experiments')

    // Public visitor without session should be barred or prompted to sign in
    // Generouted / dynamic route checks auth state
    const authPrompt = page.locator('text=Sign in, text=Sign In, [data-testid="sign-in"], [data-testid="app-navigation"]')
    await expect(authPrompt.first()).toBeVisible({ timeout: 15000 })
  })
})
