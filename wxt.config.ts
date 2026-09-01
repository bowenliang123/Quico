import { defineConfig } from 'wxt';

export default defineConfig({
  // 构建输出到可见的 dist/ 目录 (默认 .output 是隐藏目录, 不便于"加载已解压的扩展程序"时选择)
  outDir: 'dist',
  // 关闭 modulepreload 注入: 扩展页面不支持该预加载, 只会产生无害但吓人的警告
  vite: () => ({
    build: {
      modulePreload: false,
    },
  }),
  zip: {
    // 打包命令 npm run zip -> 生成 .output/quico-v2.0.0-mv3.zip, 可直接上传 Chrome Web Store
    artifactTemplate: 'quico-v{{version}}-{{manifestVersion}}.zip',
  },
  manifest: {
    name: 'Quico 快码 QR Code Generator 二维码生成器插件',
    description:
      'Productive QR Code Generator with efficiency and elegance, just feeling it on the fly. More than a QR code generator.快码二维,疾行如风。',
    permissions: ['tabs', 'storage', 'bookmarks', 'contextMenus'],
    omnibox: {
      keyword: 'quico',
    },
    options_ui: {
      page: 'main.html',
      open_in_tab: true,
    },
    action: {
      default_title: 'Quico 二维码生成器',
      default_icon: {
        16: 'icon/16.png',
        48: 'icon/48.png',
        128: 'icon/128.png',
      },
    },
  },
});
