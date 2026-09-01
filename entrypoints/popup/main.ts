import { browser } from 'wxt/browser';
import { downloadDecoratedQrPng, renderQrDataUrl } from '@/lib/qr';
import { openDeckPage, openMainPage } from '@/lib/navigation';
import './style.css';
import '@/styles/base.css';

const qrImg = document.querySelector<HTMLImageElement>('#qr-img')!;
const qrTip = document.querySelector<HTMLDivElement>('#qr-tip')!;
const editBtn = document.querySelector<HTMLButtonElement>('#btn-edit')!;
const downloadBtn = document.querySelector<HTMLButtonElement>('#btn-download')!;
const deckBtn = document.querySelector<HTMLButtonElement>('#btn-deck')!;

/** 当前页面 URL */
let currentUrl = '';

void init();

qrImg.addEventListener('click', () => void openMainPage(currentUrl));
editBtn.addEventListener('click', () => void openMainPage(currentUrl));
deckBtn.addEventListener('click', () => void openDeckPage());
downloadBtn.addEventListener('click', () => {
  void (async () => {
    downloadBtn.disabled = true;
    try {
      await downloadDecoratedQrPng(currentUrl, qrImg.src);
    } finally {
      downloadBtn.disabled = false;
    }
  })();
});

async function init(): Promise<void> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab?.url ?? '';

  if (!currentUrl) {
    qrImg.hidden = true;
    qrTip.hidden = false;
    editBtn.disabled = true;
    downloadBtn.disabled = true;
    return;
  }

  qrImg.src = await renderQrDataUrl(currentUrl);
}
