
const { test, expect } = require('@playwright/test');

test('Check DemoQA books API', async ({ request }) => {
  const response = await request.get(
    'https://demoqa.com/BookStore/v1/Books'
  );

  console.log('Status:', response.status());
  expect(response.ok()).toBeTruthy();

  const data = await response.json();

  console.log('Number of books:', data.books.length);

  const book = data.books.find(
    item => item.title === 'Learning JavaScript Design Patterns'
  );

  console.log('Matching book:', book);

  expect(book).toBeTruthy();
});
