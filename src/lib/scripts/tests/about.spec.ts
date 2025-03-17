import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://100.76.234.109:5173/');
    await expect(page.getByText('The Good News According To')).toBeVisible();
});

test('get started link', async ({ page }) => {
    await page.goto('http://100.76.234.109:5173/');
    await page.getByTestId('hamburger-icon').click();
    await page.getByRole('button', { name: "About" }).last().click();

    await expect(page.getByText('WEB Gospels')).toBeVisible();
    await expect(page.getByText('All we ask is that if you CHANGE the actual text of the World English Bible in any way,')).toBeVisible();
    await expect(page.locator('img[class="about-image"]')).toBeVisible();
});

test('sfdds', async ({ page }) => {
    await page.goto('http://100.76.234.109:5173/');
    await page.getByTestId('hamburger-icon').click();
    await page.getByRole('button', { name: "Settings" }).last().click();

    await expect(page.getByText('Verse layout')).toBeVisible();
    const selbox1 = page.getByRole('combobox').filter({ has: page.getByRole('option').filter({ hasText: 'Verses in paragraphs' }) });
    await expect(selbox1).toBeVisible();
    await expect(selbox1).toHaveValue("paragraphs");
    selbox1.selectOption("one-per-line");
    await expect(selbox1).toHaveValue("one-per-line");

    await expect(page.getByText('Images in Bible text')).toBeVisible();
    const selbox2 = page.getByRole('combobox').filter({ has: page.getByRole('option').filter({ hasText: 'Show images' }) });
    await expect(selbox2).toBeVisible();
    await expect(selbox2).toHaveValue("normal");
    await selbox2.selectOption("hidden");
    await expect(selbox2).toHaveValue("hidden");

    await expect(page.getByText('Videos in Bible text')).toBeVisible();
    const selbox3 = page.getByRole('combobox').filter({ has: page.getByRole('option').filter({ hasText: 'Show normal size' }) });
    await expect(selbox3).toBeVisible();
    await expect(selbox3).toHaveValue("normal");
    await selbox3.selectOption("hidden");
    await expect(selbox3).toHaveValue("hidden");
});
