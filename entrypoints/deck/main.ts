import { renderQrDataUrl } from '@/lib/qr';
import { getDeckUrls, saveDeckUrls } from '@/lib/storage';
import { DEFAULT_DECK_TEXT, parseDeckItems } from '@/lib/deck';
import './style.css';
import '@/styles/base.css';

const inputUrls = document.querySelector<HTMLTextAreaElement>('#input-urls')!;
const btnRender = document.querySelector<HTMLButtonElement>('#btn-render')!;
const resultList = document.querySelector<HTMLDivElement>('#result-list')!;

void init();

btnRender.addEventListener('click', () => {
  void (async () => {
    btnRender.disabled = true;
    try {
      await saveDeckUrls(inputUrls.value);
      await renderResults();
    } finally {
      btnRender.disabled = false;
    }
  })();
});

async function init(): Promise<void> {
  // 空配置时展示默认模板
  const saved = await getDeckUrls();
  inputUrls.value = saved.trim() !== '' ? saved : DEFAULT_DECK_TEXT;
  await renderResults();
}

async function renderResults(): Promise<void> {
  resultList.textContent = '';
  const items = parseDeckItems(inputUrls.value);

  let index = 0;
  for (const item of items) {
    index += 1;

    const img = document.createElement('img');
    img.className = 'result-qr';
    img.alt = '';
    img.src = await renderQrDataUrl(item.url, 100);

    const no = document.createElement('small');
    no.className = 'text-muted';
    no.textContent = `#${index}`;

    const desc = document.createElement('h3');
    desc.className = 'text-break';
    desc.textContent = item.desc;

    const url = document.createElement('p');
    url.className = 'text-muted text-break';
    url.textContent = item.url;

    const details = document.createElement('div');
    details.className = 'result-details';
    details.append(no, desc, url);

    const card = document.createElement('a');
    card.className = 'card result-card';
    card.href = item.url;
    card.target = '_blank';
    card.rel = 'noreferrer';
    card.append(img, details);

    resultList.appendChild(card);
  }

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-muted';
    empty.textContent = '左侧没有可解析的内容, 请检查格式是否为 [名称](URL)';
    resultList.appendChild(empty);
  }
}
