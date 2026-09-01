/** 常用二维码默认模板 (沿用旧版) */
export const DEFAULT_DECK_TEXT =
  '[这里写名称](https://www.google.com/?#q=这里写URL)\n\n[谷歌](https://www.google.com)';

/** 解析后的常用二维码条目 */
export interface DeckItem {
  desc: string;
  url: string;
}

/**
 * 解析常用二维码文本, 每行一条 `[名称](URL)` 格式, 无法解析的行忽略
 */
export function parseDeckItems(text: string): DeckItem[] {
  const items: DeckItem[] = [];
  for (const line of text.split('\n')) {
    // 旧版要求名称不含空白, 这里放宽为任意内容; URL 仍要求不含空白
    const match = line.trim().match(/^\[(.+?)\]\((\S+)\)$/);
    if (match?.[1] && match[2]) {
      items.push({ desc: match[1], url: match[2] });
    }
  }
  return items;
}
