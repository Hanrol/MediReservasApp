import { expect, type Page } from '@playwright/test'

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/#/login')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page).toHaveURL(/#\/dashboard$/)
}

export async function freezeMockDate(page: Page) {
  await page.clock.install({ time: new Date('2026-10-11T12:00:00') })
}
