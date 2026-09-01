import { browser } from 'wxt/browser';

/** Quico 书签文件夹名称 (沿用旧版) */
const FOLDER_TITLE = 'Quico Bookmarks';

/** 展示用书签 */
export interface QuicoBookmark {
  title: string;
  url: string;
}

/** 书签树节点 (仅声明用到的字段) */
interface BookmarkNode {
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

/**
 * 获取 Quico 书签文件夹下全部书签, 文件夹不存在时自动创建
 * @returns 书签列表和文件夹 id
 */
export async function getQuicoBookmarks(): Promise<{ folderId: string; bookmarks: QuicoBookmark[] }> {
  const found = await browser.bookmarks.search(FOLDER_TITLE);
  // 命中结果里挑出文件夹 (排除同名普通书签)
  let folder = found.find((node) => !node.url);
  if (!folder) {
    // 不传 parentId 时默认创建在"其他书签"中
    folder = await browser.bookmarks.create({ title: FOLDER_TITLE });
  }
  const subtree = await browser.bookmarks.getSubTree(folder.id);
  const root = subtree[0];
  return { folderId: folder.id, bookmarks: root ? flattenLeaves(root) : [] };
}

/** 递归收集书签叶子节点 */
function flattenLeaves(node: BookmarkNode, acc: QuicoBookmark[] = []): QuicoBookmark[] {
  if (node.url) {
    acc.push({ title: node.title, url: node.url });
  } else {
    node.children?.forEach((child) => flattenLeaves(child, acc));
  }
  return acc;
}

/** 用新标签页打开 Chrome 书签管理器并定位到 Quico 文件夹 */
export async function openQuicoBookmarksInChrome(folderId: string): Promise<void> {
  await browser.tabs.create({ url: `chrome://bookmarks/#${folderId}` });
}
