import { browser } from 'wxt/browser';

/** chrome.storage 中记录最近激活 tab 的 key (沿用旧版, 兼容已有数据) */
export const LATEST_TAB_KEY = 'latestTab';

/** chrome.storage.sync 中常用二维码配置的 key (沿用旧版, 兼容已有数据) */
export const DECK_URLS_KEY = 'deck.urls';

/** 最近激活的标签页信息 (仅记录 http/https 页面) */
export interface LatestTab {
  url: string;
  title?: string;
}

/** 读取最近激活的标签页 */
export async function getLatestTab(): Promise<LatestTab | undefined> {
  const items = await browser.storage.local.get(LATEST_TAB_KEY);
  return items[LATEST_TAB_KEY] as LatestTab | undefined;
}

/** 记录最近激活的标签页 */
export async function saveLatestTab(tab: LatestTab): Promise<void> {
  await browser.storage.local.set({ [LATEST_TAB_KEY]: tab });
}

/** 读取常用二维码配置文本 */
export async function getDeckUrls(): Promise<string> {
  const items = await browser.storage.sync.get(DECK_URLS_KEY);
  return (items[DECK_URLS_KEY] as string | undefined) ?? '';
}

/** 保存常用二维码配置文本 */
export async function saveDeckUrls(urls: string): Promise<void> {
  await browser.storage.sync.set({ [DECK_URLS_KEY]: urls });
}
