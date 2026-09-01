/** URL 可编辑组成部分 */
export interface UrlDraft {
  /** 协议 + 域名, 如 https://example.com */
  base: string;
  /** 路径, 如 /a/b */
  path: string;
  /** 查询串 (不含开头的 ?) */
  query: string;
  /** 锚点 (不含开头的 #) */
  hash: string;
}

/** 查询参数键值对 */
export interface QueryParam {
  key: string;
  value: string;
}

/**
 * 将 URL 文本解析为可编辑组成部分
 * 仅接受 http/https 链接, 其余文本返回 null (内容仍可直接生成二维码)
 */
export function urlToDraft(url: string): UrlDraft | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }
  return {
    base: parsed.origin,
    path: parsed.pathname,
    query: parsed.search.replace(/^\?/, ''),
    hash: parsed.hash.replace(/^#/, ''),
  };
}

/** 将组成部分拼回完整 URL */
export function draftToUrl(draft: UrlDraft): string {
  const query = draft.query ? `?${draft.query}` : '';
  const hash = draft.hash ? `#${draft.hash}` : '';
  return `${draft.base}${draft.path}${query}${hash}`;
}

/** 拆解查询串为键值对列表 */
export function queryToParams(query: string): QueryParam[] {
  if (!query) {
    return [];
  }
  return query
    .split('&')
    .filter((pair) => pair !== '')
    .map((pair) => {
      const eq = pair.indexOf('=');
      return eq < 0 ? { key: pair, value: '' } : { key: pair.slice(0, eq), value: pair.slice(eq + 1) };
    });
}

/** 将键值对列表拼回查询串 */
export function paramsToQuery(params: QueryParam[]): string {
  return params
    .filter((param) => param.key !== '' || param.value !== '')
    .map((param) => (param.value === '' ? param.key : `${param.key}=${param.value}`))
    .join('&');
}
