import { test, expect } from '@playwright/test';

const baseHost = process.env.BASE_HOST || 'https://localhost:3000'

function generateRandomString(length = 10) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function login(page) {
  await page.getByRole('link', { name: 'Войти' }).click();
  await page.getByPlaceholder('Почта').click();
  await page.getByPlaceholder('Почта').fill('guests@discours.io');
  await page.getByPlaceholder('Пароль').click();
  await page.getByPlaceholder('Пароль').fill('Gue$tP@ss');
  await page.getByRole('button', { name: 'Войти' }).click();
}

/* Done */
test('Open Page', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await expect(page.getByRole('link', { name: 'Дискурс', exact: true })).toBeVisible();
});

/* Done */
test('Login', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
});

test('Drafts - create article', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: 'статья' }).locator('img').click();
  /* Fill the form */
  /* Save */
  /* Check is it created */
});

test('Drafts - create literature', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: /^литература$/ }).locator('img').click();
  /* Fill the form */
  /* Save */
  /* Check is it created */
});

test('Drafts - create images', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);;
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: 'изображения' }).locator('img').click();
  /* Fill the form */
  /* Save */
  /* Check is it created */
});

test('Drafts - create music', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: 'музыка' }).locator('img').click();
  /* Fill the form */
  /* Save */
  /* Check is it created */
});

test('Drafts - create video', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: 'видео' }).locator('img').click();
   /* Fill the form */
  /* Save */
  /* Check is it created */
});


test('Post topic', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
  /* Open Draft */
  /* Post */
});

test('Subscribe to user', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
  await page.goto(`${baseHost}/author/discours`);
  await page.getByRole('main').getByRole('button', { name: 'Подписаться' }).click();
  /* Check is it subscribed */
});

/* Done */
test('Subscribe to topic', async ({ page }) => {
  await page.goto(`${baseHost}/topic/society`);
  await page.getByRole('button', { name: 'Подписаться на тему' }).click();
  await page.getByPlaceholder('Почта').click();
  await page.getByPlaceholder('Почта').fill('guests@discours.io');
  await page.getByPlaceholder('Пароль').click();
  await page.getByPlaceholder('Пароль').fill('Gue$tP@ss');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByRole('button', { name: 'Подписаться на тему' })).toBeVisible();
  await page.getByRole('button', { name: 'Подписаться на тему' }).click();
});

/* Done */
test('Un - Subscribe to topic', async ({ page }) => {
  await page.goto(`${baseHost}/topic/society`);
  await login(page);
  await expect(page.getByRole('button', { name: 'Отписаться от темы' })).toBeVisible();
  await page.getByRole('button', { name: 'Отписаться от темы' }).click();
});

/* Done */
test('Change user data', async ({ page }) => {
  await page.goto(`${baseHost}/`);
  await login(page);
  await expect(page.locator('div:nth-child(4) > a').first()).toBeVisible();
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Профиль' }).click();
  await page.getByRole('button', { name: 'Редактировать профиль' }).click();
  await page.locator('.tiptap').click();
  const randomString = generateRandomString();
  const currentDate = new Date();
  await page.locator('.tiptap').fill('test: ' + randomString + ' ' + currentDate);
  try {
    const button = await page.getByRole('button', { name: 'Сохранить настройки' });
    await button.click();
  } catch (error) {
    console.log('Button has disappeared');
  }
  await expect(page.getByText('test: ' + randomString + ' ' + currentDate)).toBeVisible();
});

/* Done */
test('Add comment to topic', async ({ page }) => {
  await page.goto(`${baseHost}/v-peschere-u-tsiklopa/`);
  await login(page);
  const randomString = generateRandomString();
  const currentDate = new Date();
  await page.locator('.tiptap').click();
  await page.locator('.tiptap').fill('Проверка Комментариев: ' + randomString + ' ' + currentDate);
  await page.getByRole('button', { name: 'Отправить' }).click();
  await expect(page.getByText('Проверка Комментариев: ' + randomString + ' ' + currentDate)).toBeVisible();
});

/* Done */
test('Edit comment to topic', async ({ page }) => {
  await page.goto(`${baseHost}/author/testdev/comments`);
  await login(page);
  const firstCommentEditButton = await page.locator('._32U0J.WXcGK').first();
  await firstCommentEditButton.click();
  const randomString = generateRandomString();
  const currentDate = new Date();
  await page.locator('.tiptap').fill('Редактируемый Комментарий: ' + randomString + ' ' + currentDate);
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText('Редактируемый Комментарий: ' + randomString + ' ' + currentDate)).toBeVisible();
});