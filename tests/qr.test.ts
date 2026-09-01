import { describe, expect, it } from 'vitest';
import { renderQrDataUrl } from '@/lib/qr';

describe('renderQrDataUrl', () => {
  it('空内容返回空字符串', async () => {
    expect(await renderQrDataUrl('')).toBe('');
  });

  it('为文本生成 PNG Data URL', async () => {
    const url = await renderQrDataUrl('https://example.com');
    expect(url).toMatch(/^data:image\/png;base64,/);
  });

  it('支持自定义边长', async () => {
    const url = await renderQrDataUrl('https://example.com', 64);
    expect(url).toMatch(/^data:image\/png;base64,/);
  });

  it('URL 与普通文本均可生成', async () => {
    expect(await renderQrDataUrl('hello quico 快码')).toMatch(/^data:image\/png;base64,/);
  });
});
