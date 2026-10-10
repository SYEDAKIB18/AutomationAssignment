
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BOOK_NAME = 'Learning JavaScript Design Patterns';

test('DemoQA Book Store: search book and save details', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('https://demoqa.com/books', {
    waitUntil: 'domcontentloaded'
  });

  const searchBox = page.locator('#searchBox');
  await expect(searchBox).toBeVisible({ timeout: 20000 });
  await searchBox.fill(BOOK_NAME);

  const bookLink = page.locator('.rt-tbody a').filter({
    hasText: BOOK_NAME
  });

  await expect(bookLink).toBeVisible({ timeout: 20000 });

  const row = page.locator('.rt-tr-group').filter({
    has: bookLink
  });

  const cells = row.locator('.rt-td');

  const title = (await cells.nth(1).innerText()).trim();
  const author = (await cells.nth(2).innerText()).trim();
  const publisher = (await cells.nth(3).innerText()).trim();

  expect(title).toBe(BOOK_NAME);
  expect(author).not.toBe('');
  expect(publisher).not.toBe('');

  const outputDir = path.join(process.cwd(), 'output');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, 'book_details.txt');

  fs.writeFileSync(
    outputFile,
    `Title: ${title}\nAuthor: ${author}\nPublisher: ${publisher}\n`,
    'utf8'
  );

  console.log(`Title: ${title}`);
  console.log(`Author: ${author}`);
  console.log(`Publisher: ${publisher}`);
  console.log(`Book details saved to: ${outputFile}`);
});





