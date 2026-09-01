import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig(async () => ({
  // WxtVitest: 注入 wxt 路径别名, 并把 wxt/browser 与全局 chrome/browser 替换为 fakeBrowser
  plugins: [await WxtVitest()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
}));
