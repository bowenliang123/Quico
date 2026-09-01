import { describe, expect, it } from 'vitest';
import { DEFAULT_DECK_TEXT, parseDeckItems } from '@/lib/deck';

describe('parseDeckItems', () => {
  it('解析每行 [名称](URL)', () => {
    const text = '[谷歌](https://www.google.com)\n[百度](https://www.baidu.com)';
    expect(parseDeckItems(text)).toEqual([
      { desc: '谷歌', url: 'https://www.google.com' },
      { desc: '百度', url: 'https://www.baidu.com' },
    ]);
  });

  it('忽略空行和无法解析的行', () => {
    const text = '\n不是链接的一行\n[谷歌](https://www.google.com)\n';
    expect(parseDeckItems(text)).toEqual([{ desc: '谷歌', url: 'https://www.google.com' }]);
  });

  it('名称允许包含空格', () => {
    expect(parseDeckItems('[My Site](https://example.com)')).toEqual([
      { desc: 'My Site', url: 'https://example.com' },
    ]);
  });

  it('URL 不允许包含空格', () => {
    expect(parseDeckItems('[谷歌](https://www.google.com/a b)')).toEqual([]);
  });

  it('首尾空白被忽略', () => {
    expect(parseDeckItems('  [谷歌](https://www.google.com)  ')).toEqual([
      { desc: '谷歌', url: 'https://www.google.com' },
    ]);
  });

  it('默认模板可被解析', () => {
    expect(parseDeckItems(DEFAULT_DECK_TEXT).length).toBeGreaterThan(0);
  });
});
