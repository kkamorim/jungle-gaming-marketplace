import { expect, test } from '@playwright/test';

test.describe('Marketplace discovery', () => {
  test('loads home and navigates to the market', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /SEJA DONO DO FUTURO/ })).toBeVisible();
    if (await page.getByRole('button', { name: 'Abrir menu' }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: 'Abrir menu' }).click();
    }
    await page.getByRole('button', { name: 'Mercado' }).click();
    await expect(page).toHaveURL(/\/market/);
    await expect(page.getByRole('heading', { name: 'Mercado' })).toBeVisible();
  });

  test('keeps discovery state in the URL after reload', async ({ page }) => {
    await page.goto('/market?q=parrot&category=arte-digital&sort=price-desc&page=2');
    await expect(page).toHaveURL(/q=parrot/);
    await page.reload();
    await expect(page).toHaveURL(/category=arte-digital/);
    await expect(page).toHaveURL(/sort=price-desc/);
    await expect(page).toHaveURL(/page=2/);
  });

  test('shows a clear state for a nonexistent NFT', async ({ page }) => {
    await page.goto('/nft/does-not-exist');
    await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Voltar ao mercado' })).toBeVisible();
  });

  test('supports the mock quick login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.getByRole('button', { name: 'Davi' }).click();
    await expect(page.getByRole('button', { name: 'Menu do usuário' })).toBeVisible();
  });

  test('opens checkout from a protected NFT purchase', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.getByRole('button', { name: 'Davi' }).click();
    await page.goto('/nft/nft-001');
    await page.getByRole('button', { name: 'Comprar' }).click();
    await expect(page.getByRole('heading', { name: 'Pagamento com Carteira' })).toBeVisible();
  });
});



