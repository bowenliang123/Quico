import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  DECK_URLS_KEY,
  LATEST_TAB_KEY,
  getDeckUrls,
  getLatestTab,
  saveDeckUrls,
  saveLatestTab,
} from '@/lib/storage';

beforeEach(() => {
  fakeBrowser.reset();
});

describe('latestTab', () => {
  it('保存并读取最近标签页', async () => {
    await saveLatestTab({ url: 'https://example.com', title: 'Example' });
    expect(await getLatestTab()).toEqual({ url: 'https://example.com', title: 'Example' });
  });

  it('未保存过时返回 undefined', async () => {
    expect(await getLatestTab()).toBeUndefined();
  });

  it('数据写入 chrome.storage.local', async () => {
    await saveLatestTab({ url: 'https://example.com' });
    const stored = await fakeBrowser.storage.local.get(LATEST_TAB_KEY);
    expect(stored[LATEST_TAB_KEY]).toEqual({ url: 'https://example.com' });
  });
});

describe('deckUrls', () => {
  it('保存并读取常用二维码配置', async () => {
    await saveDeckUrls('[谷歌](https://www.google.com)');
    expect(await getDeckUrls()).toBe('[谷歌](https://www.google.com)');
  });

  it('未保存过时返回空字符串', async () => {
    expect(await getDeckUrls()).toBe('');
  });

  it('兼容旧版本写入的数据', async () => {
    // 直接用 storage key 模拟旧版本已保存的数据
    await fakeBrowser.storage.sync.set({ [DECK_URLS_KEY]: '[谷歌](https://www.google.com)' });
    expect(await getDeckUrls()).toBe('[谷歌](https://www.google.com)');
  });
});
