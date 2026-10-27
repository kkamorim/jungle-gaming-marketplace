# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> Marketplace discovery >> loads home and navigates to the market
- Location: tests\marketplace.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /SEJA DONO DO FUTURO/ })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /SEJA DONO DO FUTURO/ }) with timeout 5000ms
  - waiting for getByRole('heading', { name: /SEJA DONO DO FUTURO/ })

```

```yaml
- strong: Something went wrong!
- button "Show Error"
```

# Test source

```ts
  1  | ﻿import { expect, test } from '@playwright/test';
  2  | 
  3  | test.describe('Marketplace discovery', () => {
  4  |   test('loads home and navigates to the market', async ({ page }) => {
  5  |     await page.goto('/');
> 6  |     await expect(page.getByRole('heading', { name: /SEJA DONO DO FUTURO/ })).toBeVisible();
     |                                                                              ^ Error: expect(locator).toBeVisible() failed
  7  |     if (await page.getByRole('button', { name: 'Abrir menu' }).isVisible().catch(() => false)) {
  8  |       await page.getByRole('button', { name: 'Abrir menu' }).click();
  9  |     }
  10 |     await page.getByRole('button', { name: 'Mercado' }).click();
  11 |     await expect(page).toHaveURL(/\/market/);
  12 |     await expect(page.getByRole('heading', { name: 'Mercado' })).toBeVisible();
  13 |   });
  14 | 
  15 |   test('keeps discovery state in the URL after reload', async ({ page }) => {
  16 |     await page.goto('/market?q=parrot&category=arte-digital&sort=price-desc&page=2');
  17 |     await expect(page).toHaveURL(/q=parrot/);
  18 |     await page.reload();
  19 |     await expect(page).toHaveURL(/category=arte-digital/);
  20 |     await expect(page).toHaveURL(/sort=price-desc/);
  21 |     await expect(page).toHaveURL(/page=2/);
  22 |   });
  23 | 
  24 |   test('shows a clear state for a nonexistent NFT', async ({ page }) => {
  25 |     await page.goto('/nft/does-not-exist');
  26 |     await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible();
  27 |     await expect(page.getByRole('button', { name: 'Voltar ao mercado' })).toBeVisible();
  28 |   });
  29 | 
  30 |   test('supports the mock quick login', async ({ page }) => {
  31 |     await page.goto('/');
  32 |     await page.getByRole('button', { name: 'Entrar' }).click();
  33 |     await page.getByRole('button', { name: 'Davi' }).click();
  34 |     await expect(page.getByRole('button', { name: 'Menu do usuário' })).toBeVisible();
  35 |   });
  36 | 
  37 |   test('opens checkout from a protected NFT purchase', async ({ page }) => {
  38 |     await page.goto('/');
  39 |     await page.getByRole('button', { name: 'Entrar' }).click();
  40 |     await page.getByRole('button', { name: 'Davi' }).click();
  41 |     await page.goto('/nft/nft-001');
  42 |     await page.getByRole('button', { name: 'Comprar' }).click();
  43 |     await expect(page.getByRole('heading', { name: 'Pagamento com Carteira' })).toBeVisible();
  44 |   });
  45 | });
  46 | 
  47 | 
  48 | 
  49 | 
```