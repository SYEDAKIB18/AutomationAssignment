
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const BASE_URL = 'https://demoqa.com/';
const USERNAME = process.env.DEMOQA_USER || 'your_username';
const PASSWORD = process.env.DEMOQA_PASS || 'your_password';
const BOOK_NAME = 'Learning JavaScript Design Patterns';
const OUTPUT_FILE = 'book_details.txt';


async function removeAds(page) {
  await page.evaluate(() => {
    document
      .querySelectorAll('#fixedban, footer, iframe, [id^=google_ads]')
      .forEach((el) => el.remove());
  });
}

test('DemoQA Book Store: login, search book, save details, logout', async ({ page }) => {
  test.setTimeout(90_000);

 
  await page.goto(BASE_URL);
  await removeAds(page);

  
  await page.locator('h5', { hasText: 'Book Store Application' }).click();
  await expect(page).toHaveURL(/\/books/);
  await removeAds(page);

  
  await page.locator('span', { hasText: /^Login$/ }).click();
  await expect(page).toHaveURL(/\/login/);
  await removeAds(page);

  await page.locator('#userName').fill(USERNAME);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('#login').click();

  
  await expect(page).toHaveURL(/\/profile/);
  await removeAds(page);
  await expect(page.locator('#userName-value')).toHaveText(USERNAME);
  const logoutBtn = page.getByRole('button', { name: 'Log out' });
  await expect(logoutBtn).toBeVisible();

  
  await page.locator('#gotoStore').click();
  await expect(page).toHaveURL(/\/books/);
  await removeAds(page);

  
  await page.locator('#searchBox').fill(BOOK_NAME);

  
  const bookLink = page.locator('.rt-tbody a', { hasText: BOOK_NAME });
  await expect(bookLink).toBeVisible();
  await expect(bookLink).toHaveText(BOOK_NAME);

  
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

 
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login/);
});

