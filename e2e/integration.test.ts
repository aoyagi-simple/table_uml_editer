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

    // スライダーで分割比率を変更
    const slider = page.locator('input[type="range"]');
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = '30';
      el.dispatchEvent(new Event('input'));
    });

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