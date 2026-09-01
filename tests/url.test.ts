import { describe, expect, it } from 'vitest';
import { draftToUrl, paramsToQuery, queryToParams, urlToDraft } from '@/lib/url';

describe('urlToDraft', () => {
  it('解析完整 URL', () => {
    expect(urlToDraft('https://example.com/a/b?x=1&y=2#top')).toEqual({
      base: 'https://example.com',
      path: '/a/b',
      query: 'x=1&y=2',
      hash: 'top',
    });
  });

  it('无 query 和 hash 时字段为空字符串', () => {
    expect(urlToDraft('http://example.com')).toEqual({
      base: 'http://example.com',
      path: '/',
      query: '',
      hash: '',
    });
  });

  it('非 http/https 协议返回 null', () => {
    expect(urlToDraft('chrome://bookmarks/')).toBeNull();
    expect(urlToDraft('javascript:alert(1)')).toBeNull();
    expect(urlToDraft('ftp://example.com/file')).toBeNull();
  });

  it('非 URL 文本返回 null', () => {
    expect(urlToDraft('随便一段文字')).toBeNull();
    expect(urlToDraft('')).toBeNull();
  });
});

describe('draftToUrl', () => {
  it('拼接全部组成部分', () => {
    expect(draftToUrl({ base: 'https://example.com', path: '/a', query: 'x=1', hash: 'top' })).toBe(
      'https://example.com/a?x=1#top',
    );
  });

  it('query 和 hash 为空时不添加分隔符', () => {
    expect(draftToUrl({ base: 'https://example.com', path: '/a', query: '', hash: '' })).toBe(
      'https://example.com/a',
    );
  });

  it('与 urlToDraft 互逆', () => {
    const url = 'https://example.com/a/b?x=1&y=2#top';
    expect(draftToUrl(urlToDraft(url)!)).toBe(url);
  });
});

describe('query 与 params 互转', () => {
  it('往返转换保持一致', () => {
    const query = 'a=1&b=2&flag';
    expect(paramsToQuery(queryToParams(query))).toBe(query);
  });

  it('无等号的参数值为空字符串', () => {
    expect(queryToParams('flag&x=1')).toEqual([
      { key: 'flag', value: '' },
      { key: 'x', value: '1' },
    ]);
  });

  it('键与值都为空的参数被过滤', () => {
    expect(paramsToQuery([{ key: 'a', value: '1' }, { key: '', value: '' }])).toBe('a=1');
  });

  it('空查询串返回空数组', () => {
    expect(queryToParams('')).toEqual([]);
  });
});
