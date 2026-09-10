(() => {
  const storageKey = 'traveler-journal-days-v2';
  const functionalTools = new Set(['plus', 'text', 'undo', 'comment', 'keyboard']);
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
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
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

  function openNewDayDialog() {
    if (document.querySelector('.stage2-new-day-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'stage2-new-day-overlay';
    const today = new Date().toISOString().slice(0, 10);
    overlay.innerHTML = `
      <form class="stage2-new-day-sheet">
        <p class="kicker">Новая запись</p>
        <h3>Добавить игровой день</h3>
        <label><span>Название</span><input name="title" required maxlength="90" autocomplete="off" placeholder="Например: Дорога к старой крепости"></label>
        <label><span>Дата</span><input name="date" type="date" required value="${today}"></label>
        <div class="stage2-sheet-actions">
          <button type="button" class="stage2-sheet-button stage2-sheet-button--ghost" data-cancel>Отмена</button>
          <button type="submit" class="stage2-sheet-button stage2-sheet-button--primary">Создать</button>
        </div>
      </form>`;
    document.body.append(overlay);
    overlay.querySelector('[data-cancel]').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) overlay.remove();
    });
    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const title = String(formData.get('title') || '').trim();
      const dateValue = String(formData.get('date') || '');
      if (!title || !dateValue) return;
      const formatted = formatDate(dateValue);
      const nextId = data.days.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
      data.days.push({
        id: nextId,
        dayLabel: `Игровой день ${data.days.length + 1}`,
        title,
        shortDate: formatted.short,
        fullDate: formatted.full,
        image: './assets/day-1.jpg',
        hero: './assets/mountain-pass.jpg',
        quote: '«Новая дорога начинается с первой записи»',
        body: ['Начните писать историю этого игрового дня...'],
        note: ['Заметка на полях'],
        footer: 'Продолжение следует.'
      });
      persist();
      state.selectedDayId = nextId;
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      overlay.remove();
      render();
    });
    requestAnimationFrame(() => overlay.querySelector('input[name="title"]')?.focus());
  }

  function enhanceChronicle() {
    document.querySelector('.entry-actions')?.remove();
    document.querySelector('.entry-menu')?.remove();
    document.querySelector('.mobile-back')?.remove();

    const entry = document.querySelector('.entry-page');
    if (!entry) return;

    if (state.mobileDetail && !entry.querySelector('.stage2-inline-back')) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'stage2-inline-back';
      back.innerHTML = '<span aria-hidden="true">‹</span> Игровые дни';
      back.addEventListener('click', () => {
        state.mobileDetail = false;
        render();
      });
      entry.insertBefore(back, entry.querySelector('.entry-header'));
    }

    const title = entry.querySelector('.entry-header h2');
    if (title && !title.dataset.stage2Editable) {
      title.dataset.stage2Editable = '1';
      title.contentEditable = 'true';
      title.spellcheck = true;
      title.classList.add('stage2-editable-title');
      title.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          title.blur();
        }
      });
      title.addEventListener('input', () => {
        const value = title.textContent.replace(/\s+/g, ' ').trimStart();
        if (value) currentDay().title = value.slice(0, 90);
        saveSoon();
      });
    }

    const editor = entry.querySelector('.entry-copy');
    if (editor && !editor.dataset.stage2Editable) {
      editor.dataset.stage2Editable = '1';
      editor.contentEditable = 'true';
      editor.spellcheck = true;
      editor.setAttribute('aria-label', 'Редактируемый текст игрового дня');
      editor.addEventListener('input', () => {
        const paragraphs = [...editor.querySelectorAll('p')]
          .map((node) => node.textContent.trim())
          .filter(Boolean);
        const plain = editor.innerText.trim();
        currentDay().body = paragraphs.length ? paragraphs : (plain ? plain.split(/\n+/).filter(Boolean) : ['']);
        saveSoon();
      });
    }

    const toolbar = entry.querySelector('.writing-toolbar');
    if (toolbar && !toolbar.dataset.stage2Toolbar) {
      toolbar.dataset.stage2Toolbar = '1';
      [...toolbar.querySelectorAll('[data-tool]')].forEach((button) => {
        if (!functionalTools.has(button.dataset.tool)) button.remove();
      });
      [...toolbar.querySelectorAll('[data-tool]')].forEach((oldButton) => {
        const button = oldButton.cloneNode(true);
        oldButton.replaceWith(button);
        button.addEventListener('click', () => {
          const tool = button.dataset.tool;
          const editArea = entry.querySelector('.entry-copy');
          toolbar.querySelectorAll('[data-tool]').forEach((item) => item.classList.toggle('is-active', item === button));
          if (tool === 'plus' && editArea) {
            const paragraph = document.createElement('p');
            paragraph.innerHTML = '<br>';
            editArea.append(paragraph);
            const range = document.createRange();
            range.selectNodeContents(paragraph);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            editArea.focus();
            saveSoon();
          } else if (tool === 'undo') {
            document.execCommand('undo');
            saveSoon();
          } else if (tool === 'comment') {
            const note = entry.querySelector('.margin-note');
            if (note) note.hidden = !note.hidden;
          } else if (editArea) {
            editArea.focus();
          }
        });
      });
    }
  }

  function enhanceList() {
    const addButton = document.querySelector('.add-day');
    if (addButton && !addButton.dataset.stage2Bound) {
      addButton.dataset.stage2Bound = '1';
      addButton.addEventListener('click', openNewDayDialog);
    }
  }

  let queued = false;
  function enhance() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      enhanceChronicle();
      enhanceList();
    });
  }

  const observer = new MutationObserver(enhance);
  observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
  restore();
  render();
  enhance();
})();
