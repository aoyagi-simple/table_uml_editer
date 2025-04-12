import { expect, test } from '@playwright/test';

test.describe('統合テスト', () => {
  test('編集・描画・保存の連携が正しく動作すること', async ({ page }) => {
    // ページを開く
    await page.goto('/');

    // テーブルエリアの確認
    const tableArea = page.locator('.table-area');
    await expect(tableArea).toBeVisible();

    // 最初のセルに値を入力
    const firstCell = page.locator('.table-area input').first();
    await firstCell.fill('テスト');
    await expect(firstCell).toHaveValue('テスト');

    // UMLエディタに入力
    const umlEditor = page.locator('.editor textarea');
    await expect(umlEditor).toBeVisible();
    await umlEditor.fill('graph TD;\nA[開始] --> B[終了]');

    // UMLビューワーの描画を確認（1秒のdebounce待ち）
    const umlViewer = page.locator('.viewer svg');
    await expect(umlViewer).toBeVisible({ timeout: 2000 });

    // スプリッターで分割比率を変更
    const splitter = page.locator('.splitter');
    const splitterContainer = page.locator('.splitter-container');
    const containerBounds = await splitterContainer.boundingBox();
    if (!containerBounds) throw new Error('スプリッターコンテナが見つかりません');

    // スプリッターを30%の位置にドラッグ
    await splitter.hover();
    await page.mouse.down();
    await page.mouse.move(
      containerBounds.x + (containerBounds.width * 0.3),
      containerBounds.y + (containerBounds.height / 2)
    );
    await page.mouse.up();

    // 保存ボタンをクリック
    const saveButton = page.locator('button.save');
    const downloadPromise = page.waitForEvent('download');
    await saveButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('table-uml-data.yaml');
  });

  test('不正入力が適切にエラー処理されること', async ({ page }) => {
    // ページを開く
    await page.goto('/');

    // 不正なUML DSLを入力
    const umlEditor = page.locator('.editor textarea');
    await umlEditor.fill('invalid mermaid syntax');

    // エラーメッセージの表示を確認（1秒のdebounce待ち）
    const errorMessage = page.locator('.error');
    await expect(errorMessage).toBeVisible({ timeout: 2000 });
    await expect(errorMessage).toContainText('error', { ignoreCase: true });

    // データなしで保存を試行
    await page.evaluate(() => {
      localStorage.clear();
    });
    const saveButton = page.locator('button.save');
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('失敗');
      await dialog.accept();
    });
    await saveButton.click();
  });
}); 