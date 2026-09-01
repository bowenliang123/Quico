import { browser } from 'wxt/browser';

/** 用新标签页打开主面板, 可携带初始二维码内容 */
export async function openMainPage(url?: string): Promise<void> {
  const query = url ? `?url=${encodeURIComponent(url)}` : '';
  await browser.tabs.create({ url: `main.html${query}` });
}

/** 用新标签页打开常用二维码面板 */
export async function openDeckPage(): Promise<void> {
  await browser.tabs.create({ url: 'deck.html' });
}
