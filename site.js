const filters = [...document.querySelectorAll('[data-filter]')];
if (filters.length) {
  const cards = [...document.querySelectorAll('#project-list [data-category]')];
  const status = document.querySelector('#filter-status');
  const allowed = new Set(filters.map(button => button.dataset.filter));

  function displayCategory(category) {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    let visible = 0;
    cards.forEach(card => {
      card.hidden = category !== 'all' && category !== card.dataset.category;
      if (!card.hidden) visible++;
    });
    status.textContent = `显示 ${visible} 个项目`;
  }

  function syncCategory() {
    const category = new URLSearchParams(location.search).get('category');
    displayCategory(allowed.has(category) ? category : 'all');
  }

  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    if (location.protocol !== 'file:') {
      const url = new URL(location.href);
      if (category === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', category);
      history.replaceState(null, '', url.href);
    }
    displayCategory(category);
  }));
  if (location.protocol !== 'file:') {
    window.addEventListener('pageshow', syncCategory);
    window.addEventListener('popstate', syncCategory);
  }
  syncCategory();
}

const copyButton = document.querySelector('#copy-email');
if (copyButton) {
  const status = document.querySelector('#copy-status');
  let reset;
  copyButton.addEventListener('click', async () => {
    window.clearTimeout(reset);
    try {
      await navigator.clipboard.writeText('zzm590@126.com');
      copyButton.textContent = '已复制';
      status.textContent = '已复制邮箱地址';
    } catch {
      const email = document.querySelector('a[href^="mailto:"]');
      const range = document.createRange();
      range.selectNodeContents(email);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      copyButton.textContent = '邮箱已选中';
      status.textContent = '邮箱地址已选中，可手动复制';
    }
    reset = window.setTimeout(() => { copyButton.textContent = '复制邮箱'; }, 2200);
  });
}

const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const images = [...document.querySelectorAll('.page-shot')];
  const lightImage = lightbox.querySelector('img');
  const position = lightbox.querySelector('.image-position');
  const scroll = lightbox.querySelector('.light-scroll');
  const zoom = lightbox.querySelector('.zoom-toggle');
  const close = lightbox.querySelector('.light-close');
  const previous = lightbox.querySelector('[data-image-step="-1"]');
  const next = lightbox.querySelector('[data-image-step="1"]');
  let current = 0;
  let trigger;

  function setZoom(enabled) {
    scroll.classList.toggle('is-zoomed', enabled);
    zoom.setAttribute('aria-pressed', String(enabled));
    zoom.textContent = enabled ? '适应宽度' : '放大';
    scroll.scrollTo(0, 0);
  }

  function showImage(index) {
    if (index < 0 || index >= images.length) return;
    current = index;
    const source = images[index];
    lightImage.src = source.href;
    lightImage.alt = source.querySelector('img').alt;
    position.textContent = `${index + 1} / ${images.length}`;
    previous.disabled = index === 0;
    next.disabled = index === images.length - 1;
    setZoom(false);
  }
  
  images.forEach((image, index) => image.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    trigger = image;
    showImage(index);
    lightbox.showModal();
    close.focus();
  }));
  previous.addEventListener('click', () => showImage(current - 1));
  next.addEventListener('click', () => showImage(current + 1));
  close.addEventListener('click', () => lightbox.close());
  zoom.addEventListener('click', () => setZoom(zoom.getAttribute('aria-pressed') !== 'true'));
  lightbox.addEventListener('keydown', event => {
    if (zoom.getAttribute('aria-pressed') === 'true') return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  lightbox.addEventListener('close', () => trigger?.focus({preventScroll: true}));

  const sections = [...document.querySelectorAll('.case-chapter')];
  const toc = [...document.querySelectorAll('.case-aside nav a')];
  let scheduled = false;
  function updateChapter() {
    let active = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= 180) active = index;
    });
    toc.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateChapter);
    }
  }, {passive: true});
  updateChapter();
}
