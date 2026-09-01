import { browser } from 'wxt/browser';
import { downloadDecoratedQrPng, renderQrDataUrl } from '@/lib/qr';
import { decodeQrFromFile } from '@/lib/decode-qr';
import {
  draftToUrl,
  paramsToQuery,
  queryToParams,
  urlToDraft,
  type QueryParam,
  type UrlDraft,
} from '@/lib/url';
import { getQuicoBookmarks, openQuicoBookmarksInChrome, type QuicoBookmark } from '@/lib/bookmarks';
import { getLatestTab } from '@/lib/storage';
import { openDeckPage } from '@/lib/navigation';
import './style.css';
import '@/styles/base.css';

/** 最近 URL 列表上限 (沿用旧版) */
const RECENT_LIMIT = 10;
/** 二维码输入防抖间隔 (ms) */
const QR_RENDER_DELAY = 120;

// DOM
const versionEl = document.querySelector<HTMLSpanElement>('#version')!;
const inputUrl = document.querySelector<HTMLTextAreaElement>('#input-url')!;
const urlLen = document.querySelector<HTMLSpanElement>('#url-len')!;
const inputBase = document.querySelector<HTMLInputElement>('#input-base')!;
const inputPath = document.querySelector<HTMLTextAreaElement>('#input-path')!;
const inputQuery = document.querySelector<HTMLTextAreaElement>('#input-query')!;
const inputHash = document.querySelector<HTMLInputElement>('#input-hash')!;
const paramRows = document.querySelector<HTMLDivElement>('#param-rows')!;
const qrImg = document.querySelector<HTMLImageElement>('#qr-img')!;
const qrEmpty = document.querySelector<HTMLDivElement>('#qr-empty')!;
const btnVisit = document.querySelector<HTMLAnchorElement>('#btn-visit')!;
const btnClear = document.querySelector<HTMLButtonElement>('#btn-clear')!;
const btnUpload = document.querySelector<HTMLButtonElement>('#btn-upload')!;
const btnDownload = document.querySelector<HTMLButtonElement>('#btn-download')!;
const uploadInput = document.querySelector<HTMLInputElement>('#upload-input')!;
const btnDeck = document.querySelector<HTMLButtonElement>('#btn-deck')!;
const btnBookmarks = document.querySelector<HTMLButtonElement>('#btn-bookmarks')!;
const bookmarksPath = document.querySelector<HTMLDivElement>('#bookmarks-path')!;
const bookmarkList = document.querySelector<HTMLDivElement>('#bookmark-list')!;
const bookmarkEmpty = document.querySelector<HTMLDivElement>('#bookmark-empty')!;
const recentList = document.querySelector<HTMLDivElement>('#recent-list')!;

// 状态
/** 当前二维码内容 */
let currentUrl = '';
/** URL 组成部分 (仅 http/https 时维护) */
let draft: UrlDraft = { base: '', path: '', query: '', hash: '' };
/** 查询参数键值对 */
let params: QueryParam[] = [];
/** Quico 书签文件夹 id */
let bookmarksFolderId = '';

/** 最近 URL 列表 */
interface RecentEntry {
  url: string;
  title: string;
  img: string;
}
const recentEntries: RecentEntry[] = [];

/** 二维码渲染防抖定时器 */
let qrTimer: ReturnType<typeof setTimeout> | undefined;
/** 二维码渲染序号, 丢弃过期渲染结果 */
let qrToken = 0;

void init();

async function init(): Promise<void> {
  versionEl.textContent = browser.runtime.getManifest().version;

  bindEvents();
  void refreshBookmarks();
  watchBookmarksChanges();
  watchTabChanges();
  void seedRecentTabs();

  // 从 GET 参数读取初始内容
  const inputUrlParam = new URLSearchParams(location.search).get('url');
  if (inputUrlParam) {
    setUrl(inputUrlParam);
  } else {
    await renderQr();
  }
}

/** ================ URL 编辑 ================ */

/** 设置二维码内容并刷新编辑区 */
function setUrl(url: string): void {
  currentUrl = url;
  inputUrl.value = url;
  applyDetails(urlToDraft(url));
  scheduleRenderQr();
}

/** 用解析结果刷新 URL 组成部分编辑区, 解析失败时清空 */
function applyDetails(next: UrlDraft | null): void {
  draft = next ?? { base: '', path: '', query: '', hash: '' };
  params = next ? queryToParams(draft.query) : [];

  inputBase.value = draft.base;
  inputPath.value = draft.path;
  inputQuery.value = draft.query;
  inputHash.value = draft.hash;

  urlLen.textContent = currentUrl ? `Len:${currentUrl.length}` : '';
  renderParamRows();
}

/** 组成部分编辑后重组 URL (query 变化时同步刷新参数行) */
function onDetailFieldChange(): void {
  draft = {
    base: inputBase.value,
    path: inputPath.value,
    query: inputQuery.value,
    hash: inputHash.value,
  };
  params = queryToParams(draft.query);

  currentUrl = draftToUrl(draft);
  inputUrl.value = currentUrl;
  urlLen.textContent = currentUrl ? `Len:${currentUrl.length}` : '';

  renderParamRows();
  scheduleRenderQr();
}

/** 参数键值对编辑后重组 query, 不重建参数行避免打断输入 */
function onParamChange(): void {
  draft.query = paramsToQuery(params);
  inputQuery.value = draft.query;

  currentUrl = draftToUrl(draft);
  inputUrl.value = currentUrl;
  urlLen.textContent = currentUrl ? `Len:${currentUrl.length}` : '';

  scheduleRenderQr();
}

/** 重建参数键值对输入行 */
function renderParamRows(): void {
  paramRows.textContent = '';
  params.forEach((param) => {
    const keyInput = document.createElement('input');
    keyInput.className = 'input mono text-accent';
    keyInput.placeholder = 'key';
    keyInput.value = param.key;
    keyInput.addEventListener('input', () => {
      param.key = keyInput.value;
      onParamChange();
    });

    const eq = document.createElement('span');
    eq.className = 'param-eq';
    eq.textContent = '=';

    const valueInput = document.createElement('input');
    valueInput.className = 'input mono text-accent';
    valueInput.placeholder = 'value';
    valueInput.value = param.value;
    valueInput.addEventListener('input', () => {
      param.value = valueInput.value;
      onParamChange();
    });

    const row = document.createElement('div');
    row.className = 'param-row';
    row.append(keyInput, eq, valueInput);
    paramRows.appendChild(row);
  });

  if (params.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'param-empty text-muted';
    empty.textContent = 'URL 无查询参数';
    paramRows.appendChild(empty);
  }
}

/** ================ 二维码渲染 ================ */

function scheduleRenderQr(): void {
  clearTimeout(qrTimer);
  qrTimer = setTimeout(() => void renderQr(), QR_RENDER_DELAY);
}

async function renderQr(): Promise<void> {
  const token = ++qrToken;
  const dataUrl = await renderQrDataUrl(currentUrl);
  if (token !== qrToken) {
    return; // 已有更新的渲染请求, 丢弃过期结果
  }

  qrImg.hidden = !dataUrl;
  qrImg.src = dataUrl;
  qrEmpty.hidden = !!dataUrl;
  updateVisitButton();
}

/** 仅 http/https 内容可访问 */
function updateVisitButton(): void {
  const visitable = /^https?:\/\//i.test(currentUrl);
  btnVisit.toggleAttribute('data-disabled', !visitable);
  if (visitable) {
    btnVisit.href = currentUrl;
  } else {
    btnVisit.removeAttribute('href');
  }
}

/** ================ 最近 URL ================ */

/** 用 chrome.storage 中记录的最近激活 tab 初始化列表 */
async function seedRecentTabs(): Promise<void> {
  const latestTab = await getLatestTab();
  if (latestTab?.url) {
    await addRecentTab(latestTab.url, latestTab.title);
  }
}

/** 监听标签页切换, 实时更新最近 URL 列表 */
function watchTabChanges(): void {
  browser.tabs.onActivated.addListener(({ tabId }) => {
    void (async () => {
      const tab = await browser.tabs.get(tabId);
      if (tab.url?.startsWith('http')) {
        await addRecentTab(tab.url, tab.title);
      }
    })();
  });
}

async function addRecentTab(url: string, title?: string): Promise<void> {
  // 去重: 已存在则提到最前
  const existingIndex = recentEntries.findIndex((entry) => entry.url === url);
  if (existingIndex >= 0) {
    recentEntries.splice(existingIndex, 1);
  }

  const img = await renderQrDataUrl(url, 96);
  recentEntries.unshift({ url, title: title ?? '', img });
  if (recentEntries.length > RECENT_LIMIT) {
    recentEntries.length = RECENT_LIMIT;
  }
  renderRecentList();
}

function renderRecentList(): void {
  recentList.textContent = '';
  for (const entry of recentEntries) {
    const img = document.createElement('img');
    img.className = 'recent-qr';
    img.src = entry.img;
    img.alt = '';

    const title = document.createElement('p');
    title.className = 'recent-item-title text-muted text-break';
    title.textContent = entry.title;

    const url = document.createElement('p');
    url.className = 'text-break';
    url.textContent = entry.url;

    const details = document.createElement('div');
    details.append(title, url);

    const item = document.createElement('div');
    item.className = 'recent-item';
    item.append(img, details);
    item.addEventListener('click', () => setUrl(entry.url));

    recentList.appendChild(item);
  }
}

/** ================ Quico 书签 ================ */

async function refreshBookmarks(): Promise<void> {
  const { folderId, bookmarks } = await getQuicoBookmarks();
  bookmarksFolderId = folderId;
  bookmarksPath.textContent = `chrome://bookmarks/#${folderId}`;
  btnBookmarks.disabled = false;

  bookmarkList.textContent = '';
  bookmarkEmpty.hidden = bookmarks.length > 0;
  bookmarkList.hidden = bookmarks.length === 0;

  for (const bookmark of bookmarks) {
    const item = document.createElement('div');
    item.className = 'bookmark-item';

    const title = document.createElement('div');
    title.className = 'text-break';
    title.textContent = bookmark.title;

    const url = document.createElement('div');
    url.className = 'text-muted text-break';
    url.textContent = bookmark.url;

    item.append(title, url);
    item.addEventListener('click', () => setUrl(bookmark.url));
    bookmarkList.appendChild(item);
  }
}

/** 监听全局书签变化, 自动刷新列表 */
function watchBookmarksChanges(): void {
  for (const event of [
    browser.bookmarks.onCreated,
    browser.bookmarks.onRemoved,
    browser.bookmarks.onChanged,
    browser.bookmarks.onMoved,
  ]) {
    event.addListener(() => void refreshBookmarks());
  }
}

/** ================ 事件绑定 ================ */

function bindEvents(): void {
  // URL 整体编辑
  inputUrl.addEventListener('input', () => setUrl(inputUrl.value));

  // URL 组成部分编辑
  for (const field of [inputBase, inputPath, inputQuery, inputHash]) {
    field.addEventListener('input', onDetailFieldChange);
  }

  // 快捷按钮
  btnClear.addEventListener('click', () => setUrl(''));
  btnDeck.addEventListener('click', () => void openDeckPage());
  btnBookmarks.addEventListener('click', () => void openQuicoBookmarksInChrome(bookmarksFolderId));

  // 上传解码二维码
  btnUpload.addEventListener('click', () => uploadInput.click());
  uploadInput.addEventListener('change', () => {
    void (async () => {
      const file = uploadInput.files?.[0];
      if (!file) {
        return;
      }
      try {
        const text = await decodeQrFromFile(file);
        if (text == null) {
          alert('未能从图片中识别出二维码');
          return;
        }
        setUrl(text);
      } catch {
        alert('图片读取失败, 请确认上传的是图片文件');
      } finally {
        uploadInput.value = '';
      }
    })();
  });

  // 下载二维码
  btnDownload.addEventListener('click', () => {
    void (async () => {
      btnDownload.disabled = true;
      try {
        await downloadDecoratedQrPng(currentUrl, qrImg.src);
      } finally {
        btnDownload.disabled = false;
      }
    })();
  });
}
