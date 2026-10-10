const { test, expect, request } = require('@playwright/test');

const BASE_URL = 'https://reqres.in';
const API_KEY = process.env.REQRES_API_KEY || '';

const NEW_USER = { name: 'morpheus', job: 'leader' };
const UPDATED_NAME = 'neo';

// Tests share state (userId), so run them in order
test.describe.configure({ mode: 'serial' });

let api;
let userId; // stored from the create-user response

test.beforeAll(async () => {
  api = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await api.dispose();
});

test('1. Create user - validate status code and store userId', async () => {
  const response = await api.post('/api/users', { data: NEW_USER });

  // Validate HTTP status code
  expect(response.status(), await response.text()).toBe(201);

  // Validate response body
  const body = await response.json();
  expect(body.name).toBe(NEW_USER.name);
  expect(body.job).toBe(NEW_USER.job);
  expect(body.id).toBeTruthy();
  expect(body.createdAt).toBeTruthy();

  // Fetch and store userId
  userId = body.id;
  console.log(`Created user id: ${userId}`);
});

test('2. Get created user details - validate', async () => {
  expect(userId, 'userId must be set by the create test').toBeTruthy();

  const response = await api.get(`/api/users/${userId}`);

  if (response.status() === 200) {
    // Persistent backend: the created user should come back as created
    const body = await response.json();
    const user = body.data || body;
    expect(String(user.id)).toBe(String(userId));
    expect(JSON.stringify(user)).toContain(NEW_USER.name);
  } else {
    // The demo /api/users endpoint is a mock: POST echoes back an id but does not
    // persist it, so a GET for that id returns 404. Record that and validate the
    // GET contract against a known fixture user instead.
    expect(response.status()).toBe(404);
    test.info().annotations.push({
      type: 'note',
      description: `ReqRes demo API does not persist created users (GET /api/users/${userId} -> 404).`,
    });

    const fixture = await api.get('/api/users/2');
    expect(fixture.status()).toBe(200);
    const body = await fixture.json();
    expect(body.data.id).toBe(2);
    expect(body.data.email).toContain('@reqres.in');
  }
});

test('3. Update user name - validate', async () => {
  expect(userId, 'userId must be set by the create test').toBeTruthy();

  const response = await api.put(`/api/users/${userId}`, {
    data: { name: UPDATED_NAME, job: NEW_USER.job },
  });

  // Validate HTTP status code
  expect(response.status(), await response.text()).toBe(200);

  // Validate updated name in response
  const body = await response.json();
  expect(body.name).toBe(UPDATED_NAME);
  expect(body.job).toBe(NEW_USER.job);
  expect(body.updatedAt).toBeTruthy();
  console.log(`Updated user ${userId}: name -> ${body.name}`);
});

