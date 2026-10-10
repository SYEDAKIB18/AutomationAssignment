/**
 * DemoQA Book Store automation (Playwright + JavaScript)
 *
 * Setup:
 *   npm init -y
 *   npm i -D @playwright/test
 *   npx playwright install chromium
 *
 * Manual step (not automated): register a user at https://demoqa.com/register
 * (solve the reCAPTCHA by hand), then run:
 *
 *   DEMOQA_USER=<username> DEMOQA_PASS=<password> npx playwright test --headed
 *
 * Windows PowerShell:
 *   $env:DEMOQA_USER="<username>"; $env:DEMOQA_PASS="<password>"; npx playwright test --headed
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE_URL = 'https://demoqa.com/';
const USERNAME = process.env.DEMOQA_USER || 'your_username';
const PASSWORD = process.env.DEMOQA_PASS || 'your_password';
const BOOK_NAME = 'Learning JavaScript Design Patterns';
const OUTPUT_FILE = 'book_details.txt';

// DemoQA ad banners/iframes can overlay elements and block clicks
async function removeAds(page) {
  await page.evaluate(() => {
    document
      .querySelectorAll('#fixedban, footer, iframe, [id^=google_ads]')
      .forEach((el) => el.remove());
  });
}

test('DemoQA Book Store: login, search book, save details, logout', async ({ page }) => {
  test.setTimeout(90_000);

  // 1. Navigate to DemoQA
  await page.goto(BASE_URL);
  await removeAds(page);

  // 2. Navigate to Book Store Application
  await page.locator('h5', { hasText: 'Book Store Application' }).click();
  await expect(page).toHaveURL(/\/books/);
  await removeAds(page);

  // 3. Login using the newly created user
  await page.locator('span', { hasText: /^Login$/ }).click();
  await expect(page).toHaveURL(/\/login/);
  await removeAds(page);

  await page.locator('#userName').fill(USERNAME);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('#login').click();

  // 4. Validate username and Log out button
  await expect(page).toHaveURL(/\/profile/);
  await removeAds(page);
  await expect(page.locator('#userName-value')).toHaveText(USERNAME);
  const logoutBtn = page.getByRole('button', { name: 'Log out' });
  await expect(logoutBtn).toBeVisible();

  // 5. Click on Book Store button
  await page.locator('#gotoStore').click();
  await expect(page).toHaveURL(/\/books/);
  await removeAds(page);

  // 6. Search "Learning JavaScript Design Patterns"
  await page.locator('#searchBox').fill(BOOK_NAME);

  // 7. Validate the search result contains the book
  const bookLink = page.locator('.rt-tbody a', { hasText: BOOK_NAME });
  await expect(bookLink).toBeVisible();
  await expect(bookLink).toHaveText(BOOK_NAME);

  // 8. Print Title, Author and Publisher into a file
  // Columns: Image | Title | Author | Publisher
  const row = page.locator('.rt-tr-group', { has: bookLink });
  const cells = row.locator('.rt-td');
  const title = (await cells.nth(1).innerText()).trim();
  const author = (await cells.nth(2).innerText()).trim();
  const publisher = (await cells.nth(3).innerText()).trim();

  fs.writeFileSync(
    OUTPUT_FILE,
    `Title: ${title}\nAuthor: ${author}\nPublisher: ${publisher}\n`,
    'utf-8'
  );
  console.log(`Title: ${title} | Author: ${author} | Publisher: ${publisher}`);
  console.log(`Book details written to ${OUTPUT_FILE}`);

  // 9. Click on Log out
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login/);
});

