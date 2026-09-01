import { browser } from 'wxt/browser';
import { openMainPage } from '@/lib/navigation';
import { saveLatestTab } from '@/lib/storage';

/** 右键菜单 id (沿用旧版) */
const CONTEXT_MENU_ID = 'quico-generate-qrcode';

export default defineBackground(() => {
  // 右键菜单只能在 onInstalled 中创建, service worker 每次唤醒都会执行顶层代码, 重复创建会报错
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({ id: CONTEXT_MENU_ID, title: 'Generate QR code' }, () => {
      // 菜单已存在时忽略 lastError
      void browser.runtime.lastError;
    });
  });

  // 右键菜单: 用主面板生成当前页面二维码
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID) {
      return;
    }
    void openMainPage(tab?.url ?? '');
  });

  // 地址栏 quico 命令: 用主面板生成输入内容的二维码
  browser.omnibox.onInputEntered.addListener((text) => {
    void openMainPage(text);
  });

  // 记录最近激活的页面 tab, 供主面板展示"最近 URL" (仅记录 http/https 页面)
  browser.tabs.onActivated.addListener(({ tabId }) => {
    void (async () => {
      const tab = await browser.tabs.get(tabId);
      if (!tab.url?.startsWith('http')) {
        return;
      }
      await saveLatestTab({ url: tab.url, title: tab.title });
    })();
  });
});
