(() => {
  const STORAGE_KEY = 'traveler-journal-characters-v1';
  let saveTimer = null;

  function persistCharacters() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.characters));
    } catch (error) {
      console.warn('Не удалось сохранить персонажей', error);
    }
  }

  function restoreCharacters() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) {
        data.characters.splice(0, data.characters.length, ...saved);
      }
    } catch (error) {
      console.warn('Не удалось восстановить персонажей', error);
    }
  }

  function currentCharacter() {
    return data.characters.find((item) => item.id === state.selectedCharacterId) || data.characters[0];
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistCharacters, 350);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function closeDialog() {
    document.querySelector('.stage3-character-overlay')?.remove();
  }

  function characterForm(character = null) {
    const isEdit = Boolean(character);
    const metaParts = character?.meta?.split('·').map((item) => item.trim()) || [];
    const race = metaParts[0] || '';
    const role = metaParts.slice(1).join(' · ') || '';
    const overlay = document.createElement('div');
    overlay.className = 'stage3-character-overlay';
    overlay.innerHTML = `
      <form class="stage3-character-sheet">
        <p class="kicker">${isEdit ? 'Карточка персонажа' : 'Новая запись'}</p>
        <h3>${isEdit ? 'Редактировать персонажа' : 'Добавить персонажа'}</h3>
        <label><span>Имя</span><input name="name" required maxlength="70" autocomplete="off" value="${escapeHtml(character?.name || '')}" placeholder="Например: Эдрик"></label>
        <div class="stage3-character-fields">
          <label><span>Раса</span><input name="race" maxlength="50" value="${escapeHtml(race)}" placeholder="Человек"></label>
          <label><span>Класс / роль</span><input name="role" maxlength="60" value="${escapeHtml(role)}" placeholder="Следопыт"></label>
        </div>
        <label><span>Заметка</span><textarea name="note" rows="4" maxlength="1200" placeholder="Кто это и почему его стоит запомнить">${escapeHtml(character?.note || '')}</textarea></label>
        <label><span>Короткая пометка</span><input name="hook" maxlength="180" value="${escapeHtml(character?.hook || '')}" placeholder="Что спросить при следующей встрече"></label>
        ${isEdit ? '<div class="stage3-danger-zone"><button type="button" class="stage3-delete-character" data-delete-character>Удалить персонажа</button></div>' : ''}
        <div class="stage3-sheet-actions">
          <button type="button" class="stage3-sheet-button stage3-sheet-button--ghost" data-cancel-character>Отмена</button>
          <button type="submit" class="stage3-sheet-button stage3-sheet-button--primary">${isEdit ? 'Сохранить' : 'Создать'}</button>
        </div>
      </form>`;

    document.body.append(overlay);
    overlay.querySelector('[data-cancel-character]').addEventListener('click', closeDialog);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeDialog();
    });

    overlay.querySelector('[data-delete-character]')?.addEventListener('click', () => {
      if (data.characters.length <= 1) {
        alert('Нельзя удалить последнего персонажа. Сначала создайте другого.');
        return;
      }
      if (!confirm(`Удалить персонажа «${character.name}»?`)) return;
      const index = data.characters.findIndex((item) => item.id === character.id);
      if (index >= 0) data.characters.splice(index, 1);
      state.selectedCharacterId = data.characters[0].id;
      state.mobileDetail = false;
      persistCharacters();
      closeDialog();
      render();
    });

    overlay.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get('name') || '').trim();
      const raceValue = String(formData.get('race') || '').trim();
      const roleValue = String(formData.get('role') || '').trim();
      const noteValue = String(formData.get('note') || '').trim();
      const hookValue = String(formData.get('hook') || '').trim();
      if (!name) return;
      const meta = [raceValue, roleValue].filter(Boolean).join(' · ') || 'Без описания';

      if (character) {
        character.name = name;
        character.meta = meta;
        character.note = noteValue || 'Добавьте заметки путешественника.';
        character.hook = hookValue || 'Добавьте короткую пометку.';
      } else {
        const created = {
          id: `character-${Date.now()}`,
          name,
          meta,
          portrait: './assets/day-2.jpg',
          note: noteValue || 'Добавьте заметки путешественника.',
          hook: hookValue || 'Добавьте короткую пометку.'
        };
        data.characters.push(created);
        state.selectedCharacterId = created.id;
        state.section = 'characters';
        state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      }

      persistCharacters();
      closeDialog();
      render();
    });

    requestAnimationFrame(() => overlay.querySelector('input[name="name"]')?.focus());
  }

  function enhanceCharacterList() {
    if (state.section !== 'characters') return;
    const addButton = document.querySelector('.character-index .search-strip button');
    if (addButton && !addButton.dataset.stage3Bound) {
      addButton.dataset.stage3Bound = '1';
      addButton.title = 'Добавить персонажа';
      addButton.addEventListener('click', () => characterForm());
    }
  }

  function enhanceCharacterDetail() {
    if (state.section !== 'characters') return;
    const card = document.querySelector('.character-card');
    if (!card) return;
    const character = currentCharacter();
    if (!character) return;

    if (!card.querySelector('.stage3-edit-character')) {
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'stage3-edit-character';
      editButton.textContent = 'Править';
      editButton.addEventListener('click', () => characterForm(character));
      card.append(editButton);
    }

    const noteHeading = [...card.querySelectorAll('h3')].find((node) => node.textContent.includes('Заметки'));
    const note = noteHeading?.nextElementSibling;
    if (note && !note.dataset.stage3Editable) {
      note.dataset.stage3Editable = '1';
      note.contentEditable = 'true';
      note.spellcheck = true;
      note.classList.add('stage3-editable-character-note');
      note.setAttribute('aria-label', 'Редактируемые заметки о персонаже');
      note.addEventListener('input', () => {
        character.note = note.innerText.trim();
        saveSoon();
      });
    }

    const hook = card.querySelector('.handwritten');
    if (hook && !hook.dataset.stage3Editable) {
      hook.dataset.stage3Editable = '1';
      hook.contentEditable = 'true';
      hook.spellcheck = true;
      hook.classList.add('stage3-editable-character-hook');
      hook.setAttribute('aria-label', 'Редактируемая короткая пометка');
      hook.addEventListener('input', () => {
        character.hook = hook.innerText.trim();
        saveSoon();
      });
    }
  }

  let queued = false;
  function enhance() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      enhanceCharacterList();
      enhanceCharacterDetail();
    });
  }

  restoreCharacters();
  const observer = new MutationObserver(enhance);
  observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
  render();
  enhance();
})();
