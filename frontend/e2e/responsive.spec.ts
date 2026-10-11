import { expect, test } from '@playwright/test'

test('CP-131 · RNF-01 · páginas públicas no desbordan en móvil, tablet y escritorio', async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/#/')
    await expect(page.getByRole('heading', { name: /Reserva tu hora médica/ })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    await page.goto('/#/medicos-especialidades')
    await expect(page.getByRole('heading', { name: 'Médicos disponibles' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
})
