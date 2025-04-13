import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // ページを開く
  await page.goto('http://localhost:5173');
  // アプリケーションの読み込みを待機
  await page.waitForLoadState('networkidle');
});

test('編集・描画・保存の連携が正しく動作すること', async ({ page }) => {
  // テーブルのセルを編集
  await page.locator('.grid-cell').first().click();
  await page.keyboard.type('テストデータ');
  await page.keyboard.press('Enter');

  // UMLビューアーが正しく表示されることを確認
  const viewer = page.locator('[data-testid="uml-viewer"]');
  await expect(viewer).toBeVisible({ timeout: 10000 });

  // 保存ボタンをクリックしてダウンロードを開始
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button.save').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('table-uml-data.yaml');

  // ダウンロードされたファイルの内容を確認
  const path = await download.path();
  expect(path).toBeTruthy();
});

test('不正入力が適切にエラー処理されること', async ({ page }) => {
  // 不正なUML構文を入力
  await page.locator('textarea[placeholder="Mermaid DSLを入力してください"]').click();
  await page.keyboard.type('invalid');
  await page.keyboard.press('Enter');

  // エラーメッセージが表示されることを確認
  const errorMessage = page.locator('[data-testid="error-message"]');
  await expect(errorMessage).toBeVisible({ timeout: 10000 });
  await expect(errorMessage).toContainText('エラー: ');
});