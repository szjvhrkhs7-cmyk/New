(() => {
  const storageKey = 'traveler-journal-days-v3';
  const legacyStorageKeys = ['traveler-journal-days-v2'];
  const functionalTools = new Set(['plus', 'text', 'undo', 'comment', 'image', 'keyboard']);
  let saveTimer = null;

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data.days));
    } catch (error) {
      console.warn('Не удалось сохранить дневник', error);
    }
  }

  function restore() {
    try {
      let raw = localStorage.getItem(storageKey);
      if (!raw) {
        for (const key of legacyStorageKeys) {
          raw = localStorage.getItem(key);
          if (raw) break;
        }
      }
      const saved = JSON.parse(raw || 'null');
      if (Array.isArray(saved) && saved.length) {
        data.days.splice(0, data.days.length, ...saved);
      }
    } catch (error) {
      console.warn('Не удалось восстановить дневник', error);
    }
  }

  function saveSoon() {
    const status = document.querySelector('.section-subtitle');
    if (status) status.textContent = 'Сохранение...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      persist();
      const current = document.querySelector('.section-subtitle');
      if (current) current.textContent = 'Сохранено';
    }, 400);
  }

  function formatDate(value) {
    const date = new Date(`${value}T12:00:00`);
    return {
      short: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(date).replace(' г.', ''),
      full: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date).replace(' г.', ''),
    };
  }

  function currentDay() {
    return data.days.find((item) => Number(item.id) === Number(state.selectedDayId)) || data.days[0];
  }

  function dateToInput() {
    const day = currentDay();
    if (day.dateISO) return day.dateISO;
    const match = String(day.fullDate || '').match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4})/i);
    const months = { января:0, февраля:1, марта:2, апреля:3, мая:4, июня:5, июля:6, августа:7, сентября:8, октября:9, ноября:10, декабря:11 };
    if (match && months[match[2].toLowerCase()] !== undefined) {
      return new Date(Number(match[3]), months[match[2].toLowerCase()], Number(match[1]), 12).toISOString().slice(0,10);
    }
    return new Date().toISOString().slice(0,10);
  }

  function escapeAttribute(value) {
    return String(value ?? '').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }

  function createDialogShell(innerHTML) {
    document.querySelector('.stage2-new-day-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'stage2-new-day-overlay';
    overlay.innerHTML = innerHTML;
    document.body.append(overlay);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
    overlay.querySelector('[data-cancel]')?.addEventListener('click', () => overlay.remove());
    return overlay;
  }

  function openNewDayDialog() {
    const today = new Date().toISOString().slice(0, 10);
    const overlay = createDialogShell(`
      <form class="stage2-new-day-sheet">
        <p class="kicker">Новая запись</p>
        <h3>Добавить игровой день</h3>
        <label><span>Название</span><input name="title" required maxlength="90" autocomplete="off" placeholder="Например: Дорога к старой крепости"></label>
        <label><span>Дата</span><input name="date" type="date" required value="${today}"></label>
        <div class="stage2-sheet-actions">
          <button type="button" class="stage2-sheet-button stage2-sheet-button--ghost" data-cancel>Отмена</button>
          <button type="submit" class="stage2-sheet-button stage2-sheet-button--primary">Создать</button>
        </div>
      </form>`);
    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const title = String(formData.get('title') || '').trim();
      const dateValue = String(formData.get('date') || '');
      if (!title || !dateValue) return;
      const formatted = formatDate(dateValue);
      const nextId = data.days.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
      data.days.push({ id:nextId, dayLabel:`Игровой день ${data.days.length + 1}`, title, shortDate:formatted.short, fullDate:formatted.full, dateISO:dateValue, image:'./assets/day-1.jpg', hero:'./assets/mountain-pass.jpg', quote:'«Новая дорога начинается с первой записи»', body:['Начните писать историю этого игрового дня...'], note:['Заметка на полях'], footer:'Продолжение следует.' });
      persist();
      state.selectedDayId = nextId;
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      overlay.remove();
      render();
    });
    requestAnimationFrame(() => overlay.querySelector('input[name="title"]')?.focus());
  }

  function openEditDayDialog() {
    const day = currentDay();
    const overlay = createDialogShell(`
      <form class="stage2-new-day-sheet stage2-edit-day-sheet">
        <p class="kicker">Игровой день</p>
        <h3>Настройки записи</h3>
        <label><span>Название</span><input name="title" required maxlength="90" autocomplete="off" value="${escapeAttribute(day.title)}"></label>
        <label><span>Дата</span><input name="date" type="date" required value="${dateToInput()}"></label>
        <div class="stage2-danger-zone"><button type="button" class="stage2-delete-day" data-delete-day>Удалить игровой день</button></div>
        <div class="stage2-sheet-actions">
          <button type="button" class="stage2-sheet-button stage2-sheet-button--ghost" data-cancel>Отмена</button>
          <button type="submit" class="stage2-sheet-button stage2-sheet-button--primary">Сохранить</button>
        </div>
      </form>`);
    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const title = String(formData.get('title') || '').trim();
      const dateValue = String(formData.get('date') || '');
      if (!title || !dateValue) return;
      const formatted = formatDate(dateValue);
      day.title = title;
      day.shortDate = formatted.short;
      day.fullDate = formatted.full;
      day.dateISO = dateValue;
      persist();
      overlay.remove();
      render();
    });
    overlay.querySelector('[data-delete-day]').addEventListener('click', () => {
      if (data.days.length <= 1) { alert('В журнале должен остаться хотя бы один игровой день.'); return; }
      if (!confirm(`Удалить «${day.title}»? Это действие нельзя отменить.`)) return;
      const index = data.days.findIndex((item) => Number(item.id) === Number(day.id));
      data.days.splice(index, 1);
      data.days.forEach((item, itemIndex) => { item.dayLabel = `Игровой день ${itemIndex + 1}`; });
      const fallback = data.days[Math.max(0, Math.min(index, data.days.length - 1))];
      state.selectedDayId = fallback.id;
      state.mobileDetail = false;
      persist();
      overlay.remove();
      render();
    });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
  }

  async function compressImage(file) {
    const source = await fileToDataUrl(file);
    const image = await loadImage(source);
    const maxSize = 1600;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.78);
  }

  function chooseWallpaper() {
    const picker = document.createElement('input');
    picker.type = 'file'; picker.accept = 'image/*'; picker.hidden = true; document.body.append(picker);
    picker.addEventListener('change', async () => {
      const file = picker.files?.[0];
      if (!file) { picker.remove(); return; }
      try { currentDay().wallpaperDataUrl = await compressImage(file); persist(); render(); }
      catch (error) { console.warn('Не удалось установить изображение', error); alert('Не удалось обработать изображение. Попробуйте другой файл.'); }
      finally { picker.remove(); }
    }, { once:true });
    picker.click();
  }

  function applyCustomWallpapers() {
    data.days.forEach((day) => {
      if (!day.wallpaperDataUrl) return;
      const row = document.querySelector(`[data-day="${day.id}"] .day-thumb`);
      if (row) { row.style.backgroundImage = `url("${day.wallpaperDataUrl}")`; row.style.backgroundSize = 'cover'; row.style.backgroundPosition = 'center'; }
    });
    const hero = document.querySelector('.entry-hero-image');
    const day = currentDay();
    if (hero && day.wallpaperDataUrl) { hero.style.backgroundImage = `url("${day.wallpaperDataUrl}")`; hero.style.backgroundSize = 'cover'; hero.style.backgroundPosition = 'center'; }
  }

  function enhanceChronicle() {
    document.querySelector('.entry-actions')?.remove();
    document.querySelector('.entry-menu')?.remove();
    document.querySelector('.mobile-back')?.remove();
    const entry = document.querySelector('.entry-page');
    if (!entry) { applyCustomWallpapers(); return; }
    const header = entry.querySelector('.entry-header');
    if (state.mobileDetail && header && !entry.querySelector('.stage2-inline-back')) {
      const back = document.createElement('button');
      back.type = 'button'; back.className = 'stage2-inline-back'; back.innerHTML = '<span aria-hidden="true">‹</span><span>Игровые дни</span>';
      back.addEventListener('click', () => { state.mobileDetail = false; render(); });
      entry.insertBefore(back, header);
    }
    if (header && !header.querySelector('.stage2-edit-day')) {
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'stage2-edit-day'; edit.textContent = 'Править'; edit.addEventListener('click', openEditDayDialog); header.append(edit);
    }
    const title = entry.querySelector('.entry-header h2');
    if (title && !title.dataset.stage2Editable) {
      title.dataset.stage2Editable = '1'; title.contentEditable = 'true'; title.spellcheck = true; title.classList.add('stage2-editable-title');
      title.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); title.blur(); } });
      title.addEventListener('input', () => { const value = title.textContent.replace(/\s+/g,' ').trimStart(); if (value) currentDay().title = value.slice(0,90); saveSoon(); });
    }
    const editor = entry.querySelector('.entry-copy');
    if (editor && !editor.dataset.stage2Editable) {
      editor.dataset.stage2Editable = '1'; editor.contentEditable = 'true'; editor.spellcheck = true; editor.setAttribute('aria-label','Редактируемый текст игрового дня');
      editor.addEventListener('input', () => { const paragraphs = [...editor.querySelectorAll('p')].map((node) => node.textContent.trim()).filter(Boolean); const plain = editor.innerText.trim(); currentDay().body = paragraphs.length ? paragraphs : (plain ? plain.split(/\n+/).filter(Boolean) : ['']); saveSoon(); });
    }
    const note = entry.querySelector('.margin-note');
    if (note && !note.dataset.stage2Editable) {
      note.dataset.stage2Editable = '1'; note.contentEditable = 'true'; note.spellcheck = true; note.setAttribute('aria-label','Редактируемая заметка на полях');
      note.addEventListener('input', () => { const lines = [...note.querySelectorAll('p')].map((node) => node.textContent.trim()).filter(Boolean); if (lines.length) currentDay().note = lines; saveSoon(); });
    }
    const toolbar = entry.querySelector('.writing-toolbar');
    if (toolbar && !toolbar.dataset.stage2Toolbar) {
      toolbar.dataset.stage2Toolbar = '1';
      [...toolbar.querySelectorAll('[data-tool]')].forEach((button) => { if (!functionalTools.has(button.dataset.tool)) button.remove(); });
      [...toolbar.querySelectorAll('[data-tool]')].forEach((oldButton) => {
        const button = oldButton.cloneNode(true); oldButton.replaceWith(button);
        button.addEventListener('click', () => {
          const tool = button.dataset.tool; const editArea = entry.querySelector('.entry-copy'); toolbar.querySelectorAll('[data-tool]').forEach((item) => item.classList.toggle('is-active', item === button));
          if (tool === 'plus' && editArea) {
            const paragraph = document.createElement('p'); paragraph.innerHTML = '<br>'; editArea.append(paragraph); const range = document.createRange(); range.selectNodeContents(paragraph); range.collapse(false); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); editArea.focus(); saveSoon();
          } else if (tool === 'undo') { document.execCommand('undo'); saveSoon(); }
          else if (tool === 'comment') { const marginNote = entry.querySelector('.margin-note'); if (marginNote) { marginNote.hidden = !marginNote.hidden; if (!marginNote.hidden) marginNote.focus(); } }
          else if (tool === 'image') { chooseWallpaper(); }
          else if (editArea) { editArea.focus(); }
        });
      });
    }
    applyCustomWallpapers();
  }

  function enhanceList() {
    const addButton = document.querySelector('.add-day');
    if (addButton && !addButton.dataset.stage2Bound) { addButton.dataset.stage2Bound = '1'; addButton.addEventListener('click', openNewDayDialog); }
    applyCustomWallpapers();
  }

  let queued = false;
  function enhance() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; enhanceChronicle(); enhanceList(); });
  }

  const observer = new MutationObserver(enhance);
  observer.observe(document.querySelector('#app'), { childList:true, subtree:true });
  restore();
  render();
  enhance();
})();
