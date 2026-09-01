import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { getQuicoBookmarks, openQuicoBookmarksInChrome } from '@/lib/bookmarks';

beforeEach(() => {
  fakeBrowser.reset();
  vi.restoreAllMocks();
});

describe('getQuicoBookmarks', () => {
  it('文件夹不存在时自动创建, 并递归展开书签树', async () => {
    // bookmarks API 带 Promise/回调双签名, mock 时用 mockImplementation
    vi.spyOn(fakeBrowser.bookmarks, 'search').mockImplementation(async () => []);
    vi.spyOn(fakeBrowser.bookmarks, 'create').mockImplementation(async () => ({
      id: '10',
      title: 'Quico Bookmarks',
    }));
    vi.spyOn(fakeBrowser.bookmarks, 'getSubTree').mockImplementation(async () => [
      {
        id: '10',
        title: 'Quico Bookmarks',
        children: [
          { id: '11', title: '谷歌', url: 'https://www.google.com' },
          {
            id: '12',
            title: '子文件夹',
            children: [{ id: '13', title: '百度', url: 'https://www.baidu.com' }],
          },
        ],
      },
    ]);

    const { folderId, bookmarks } = await getQuicoBookmarks();

    expect(fakeBrowser.bookmarks.create).toHaveBeenCalledWith({ title: 'Quico Bookmarks' });
    expect(folderId).toBe('10');
    // 文件夹节点被跳过, 只保留书签叶子
    expect(bookmarks).toEqual([
      { title: '谷歌', url: 'https://www.google.com' },
      { title: '百度', url: 'https://www.baidu.com' },
    ]);
  });

  it('文件夹已存在时不重复创建', async () => {
    vi.spyOn(fakeBrowser.bookmarks, 'search').mockImplementation(async () => [
      // 与文件夹同名的普通书签不应命中
      { id: '5', title: 'Quico Bookmarks', url: 'https://same-name.example.com' },
      { id: '9', title: 'Quico Bookmarks' },
    ]);
    const createSpy = vi.spyOn(fakeBrowser.bookmarks, 'create');
    const getSubTree = vi
      .spyOn(fakeBrowser.bookmarks, 'getSubTree')
      .mockImplementation(async () => [
        {
          id: '9',
          title: 'Quico Bookmarks',
          children: [{ id: '12', title: '谷歌', url: 'https://www.google.com' }],
        },
      ]);

    const { folderId, bookmarks } = await getQuicoBookmarks();

    expect(createSpy).not.toHaveBeenCalled();
    expect(getSubTree).toHaveBeenCalledWith('9');
    expect(folderId).toBe('9');
    expect(bookmarks).toEqual([{ title: '谷歌', url: 'https://www.google.com' }]);
  });
});

describe('openQuicoBookmarksInChrome', () => {
  it('用新标签页打开书签管理器并定位到文件夹', async () => {
    const createSpy = vi.spyOn(fakeBrowser.tabs, 'create');

    await openQuicoBookmarksInChrome('9');

    expect(createSpy).toHaveBeenCalledWith({ url: 'chrome://bookmarks/#9' });
  });
});
