import { expect, test } from '@playwright/test';

test('server-defined RTL and field values survive real keyboard/touch interactions', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main[dir="rtl"][lang="ar"]')).toBeVisible();
    await page.getByRole('textbox', { name: 'Full name' }).fill('Moustafa');
    await page.getByRole('combobox', { name: 'Role' }).selectOption('admin');
    await page.getByRole('checkbox', { name: 'Active' }).click();

    const values = await page.locator('#fixture-form').evaluate((form) =>
        Object.fromEntries(new FormData(form as HTMLFormElement).entries()),
    );
    expect(values).toMatchObject({ name: 'Moustafa', role: 'admin', active: '0', notes: 'Started' });
});

test('snapshot Table supports pagination, local search and sorting without server requests', async ({ page }) => {
    await page.goto('/');
    const table = page.locator('table');
    await expect(table.locator('tbody tr')).toHaveCount(5);
    await expect(table.locator('tbody')).toContainText('Person 1');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(table.locator('tbody')).toContainText('Person 6');

    await page.getByRole('searchbox', { name: 'Search records...' }).fill('Person 12');
    await expect(table.locator('tbody tr')).toHaveCount(1);
    await expect(table.locator('tbody')).toContainText('Person 12');

    await page.getByRole('searchbox', { name: 'Search records...' }).fill('');
    const sort = page.getByRole('button', { name: /Name/ });
    await sort.click();
    await sort.click();
    await expect(page.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');
    await expect(table.locator('tbody tr').first()).toContainText('Person 12');
});

test('column manager and filters update visible rows without losing the table header', async ({ page }) => {
    await page.goto('/');
    const table = page.locator('table');
    await page.getByText('Columns', { exact: true }).click();
    await page.getByRole('checkbox', { name: 'Status' }).click();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toHaveCount(0);
    await expect(page.getByRole('columnheader', { name: /Name/ })).toHaveCount(1);

    await page.locator('section[aria-label="Members"] header select').selectOption('paused');
    await expect(table.locator('tbody tr')).toHaveCount(5);
    await expect(table.locator('tbody')).toContainText('Person 2');
    await expect(table.getByRole('cell', { name: 'Person 1', exact: true })).toHaveCount(0);
});

test('the shell fits a mobile viewport and remains RTL on initial render', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
});

test('switches between default and Shadcn UI without changing the serialized component tree', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('section[aria-label="Members"]')).toBeVisible();

    await page.getByRole('button', { name: 'Switch to default UI' }).click();
    await expect(page.locator('main')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('section[aria-label="Members"]')).toBeVisible();
    await expect(page.locator('table tbody')).toContainText('Person 1');
    await expect(page.getByRole('button', { name: 'Switch to Shadcn UI' })).toBeVisible();

    await page.getByRole('button', { name: 'Switch to Shadcn UI' }).click();
    await expect(page.locator('section[aria-label="Members"]')).toBeVisible();
    await expect(page.locator('table tbody')).toContainText('Person 1');
});
