import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { get } from 'svelte/store';
import TopRightButtons from './TopRightButtons.svelte';
import { tableStore } from '../../models/state/store';
import { YamlSaver } from '../../models/yaml/save';

describe('TopRightButtons', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    tableStore.reset();
    
    // グローバルオブジェクトのモック
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:test'),
      revokeObjectURL: vi.fn()
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('正常系', () => {
    it('保存ボタンとヘルプ表示が正しく動作すること', async () => {
      const { container } = render(TopRightButtons);
      
      // 初期状態の確認
      expect(container.querySelector('.overlay')).toBeFalsy();
      
      // ヘルプボタンをクリック
      const helpButton = container.querySelector('.help');
      await fireEvent.click(helpButton!);
      
      // ヘルプオーバーレイが表示されることを確認
      expect(container.querySelector('.overlay')).toBeTruthy();
      expect(container.querySelector('.help-content')).toBeTruthy();
      
      // 保存ボタンをクリック
      const saveButton = container.querySelector('.save');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');
      
      await fireEvent.click(saveButton!);
      
      // YAMLファイルのダウンロードが実行されることを確認
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('異常系', () => {
    it('データなしエラーが適切に処理されること', async () => {
      const { container } = render(TopRightButtons);
      
      // YamlSaverのモックを設定
      const toYamlSpy = vi.spyOn(YamlSaver, 'toYaml').mockImplementation(() => {
        throw new Error('データがありません');
      });
      
      // alertのモック
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      // 保存ボタンをクリック
      const saveButton = container.querySelector('.save');
      await fireEvent.click(saveButton!);
      
      // エラーメッセージが表示されることを確認
      expect(alertSpy).toHaveBeenCalledWith('保存に失敗しました: データがありません');
      
      // モックをリセット
      toYamlSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });
}); 