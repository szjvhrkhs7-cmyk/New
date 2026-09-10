const params = new URLSearchParams(window.location.search);

const state = {
  section: params.get('section') || 'chronicles',
  selectedDayId: Number(params.get('day') || 1),
  selectedCharacterId: params.get('character') || 'kazl',
  selectedAtlasId: params.get('atlas') || 'black-harbor',
  mobileDetail: params.get('detail') === '1',
  activeTool: 'text',
  showMarginNote: true,
  isBookmarked: false,
  isEntryMenuOpen: false,
};

const toolbarActions = [
  { id: 'spark', label: 'Идея' },
  { id: 'plus', label: 'Новый блок' },
  { id: 'text', label: 'Текст' },
  { id: 'mic', label: 'Голос' },
  { id: 'image', label: 'Изображение' },
  { id: 'swap', label: 'Вариант' },
  { id: 'undo', label: 'Отменить' },
  { id: 'smile', label: 'Тон' },
  { id: 'comment', label: 'Примечание' },
  { id: 'keyboard', label: 'Режим ввода' },
];

const tabs = [
  { id: 'chronicles', label: 'Хроники' },
  { id: 'characters', label: 'Персонажи' },
  { id: 'atlas', label: 'Атлас' },
];

const app = document.querySelector('#app');

function icon(name, className = '') {
  const icons = {
    compass: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="21"/><path d="M38.5 23 33 34.5 22 40l5.6-11.1 10.9-5.9Z"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8"/></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5c0-.8.7-1.5 1.5-1.5h7c.8 0 1.5.7 1.5 1.5V21l-5-3.5L7 21V4.5Z"/></svg>`,
    more: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
    feather: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M52 7c-17 4-30 14-36 28-3 8-4 14-4 22 6-9 12-15 18-20 8-7 15-13 22-30Z"/><path d="M12 57c8-11 18-20 30-29"/></svg>`,
    spark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/></svg>`,
    text: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7v10M14 7v10M7 17h10"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="4" width="6" height="10" rx="3"/><path d="M6.5 11.5A5.5 5.5 0 0 0 12 17a5.5 5.5 0 0 0 5.5-5.5M12 17v3M9 20h6"/></svg>`,
    image: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m7 17 4-4 3 3 3-4 2 5"/></svg>`,
    swap: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-3-3M17 17H6l3 3M18 7l-3-3M6 17l3 3"/></svg>`,
    undo: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H4v5"/><path d="M4 12c1.8-4 5.4-6 9.2-6C18 6 21 9 21 13s-3 7-7 7"/></svg>`,
    smile: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.4 2.1 2 3.5 2s2.5-.6 3.5-2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 4 20V7.5A2.5 2.5 0 0 1 6.5 5H17.5A2.5 2.5 0 0 1 20 7.5v7A2.5 2.5 0 0 1 17.5 17H6Z"/></svg>`,
    keyboard: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h1M10 9h1M13 9h1M16 9h1M6 12h1M9 12h1M12 12h1M15 12h1M18 12h1M7 15h10"/></svg>`,
    search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/></svg>`
  };

  return `<span class="icon ${className}">${icons[name] ?? ''}</span>`;
}

const spritePositions = {
  'day-1.jpg': ['0%', '0%'],
  'day-2.jpg': ['33.333%', '0%'],
  'day-3.jpg': ['66.667%', '0%'],
  'day-4.jpg': ['100%', '0%'],
  'day-5.jpg': ['0%', '100%'],
  'day-6.jpg': ['33.333%', '100%'],
  'mountain-pass.jpg': ['66.667%', '100%'],
  'atlas-harbor.jpg': ['100%', '100%'],
};

function spriteImage(path, className, label = '') {
  const key = path.split('/').pop();
  const [x, y] = spritePositions[key] ?? ['0%', '0%'];
  const aria = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<span class="sprite-image ${className}" ${aria} style="--sprite-x:${x};--sprite-y:${y}"></span>`;
}

function getCurrentDay() {
  return data.days.find((item) => item.id === state.selectedDayId) ?? data.days[0];
}

function getCurrentCharacter() {
  return data.characters.find((item) => item.id === state.selectedCharacterId) ?? data.characters[0];
}

function getCurrentAtlas() {
  return data.atlas.find((item) => item.id === state.selectedAtlasId) ?? data.atlas[0];
}

function tabsMarkup() {
  return `
    <nav class="bookmark-tabs" aria-label="Разделы дневника">
      ${tabs.map((tab) => `
        <button class="bookmark-tab bookmark-tab--${tab.id} ${state.section === tab.id ? 'is-active' : ''}" data-section="${tab.id}" type="button">
          <span>${tab.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

function campaignList() {
  return `
    <section class="campaign-page" aria-label="Игровые дни">
      <div class="page-corners" aria-hidden="true"></div>
      <div class="campaign-heading">
        <div>
          <p class="kicker">Путевой журнал</p>
          <h1>Туманы Вельмора</h1>
          <p class="campaign-meta">Кампания · ${data.days.length} записей</p>
        </div>
        <div class="mountain-mark" aria-hidden="true">
          <svg viewBox="0 0 190 62"><path d="M5 55 40 27l17 13 25-31 24 33 15-18 29 31M19 55h153M42 28l8 27M82 9 91 55M118 25l10 30"/></svg>
        </div>
      </div>

      <div class="day-list">
        ${data.days.map((day) => `
          <button class="day-row ${day.id === state.selectedDayId ? 'is-current' : ''}" data-day="${day.id}" type="button">
            ${spriteImage(day.image, 'day-thumb')}
            <span class="day-copy">
              <span class="day-number">${day.dayLabel}</span>
              <strong>${day.title}</strong>
              <small>${day.shortDate}</small>
            </span>
            ${icon('arrow', 'day-arrow')}
          </button>
        `).join('')}
      </div>

      <button class="add-day" type="button" aria-label="Добавить игровой день">
        ${icon('plus')}
        <span>Добавить игровой день</span>
      </button>

      <div class="left-page-footer" aria-hidden="true">
        <span>✦</span><span>✦</span><span>✦</span>
      </div>
    </section>
  `;
}

function chronicleEntry() {
  const day = getCurrentDay();

  return `
    <article class="entry-page ${state.showMarginNote ? '' : 'is-note-hidden'}" aria-label="Запись игрового дня">
      <div class="page-corners" aria-hidden="true"></div>
      <div class="entry-ribbon" aria-hidden="true"></div>
      <header class="entry-header">
        <div class="entry-title-block">
          <p class="day-label">${day.dayLabel}</p>
          <h2>${day.title}</h2>
          <div class="entry-meta-row">
            <p class="entry-date">${day.fullDate}</p>
            ${state.isBookmarked ? '<span class="entry-pin">В закладках</span>' : ''}
          </div>
        </div>
        <div class="entry-actions">
          <button class="icon-button ${state.isEntryMenuOpen ? 'is-active' : ''}" type="button" data-action="toggle-entry-menu" aria-label="Другие действия" aria-expanded="${state.isEntryMenuOpen}">${icon('more')}</button>
          <button class="icon-button ${state.isBookmarked ? 'is-active is-bookmarked' : ''}" type="button" data-action="toggle-bookmark" aria-label="Добавить в закладки" aria-pressed="${state.isBookmarked}">${icon('bookmark')}</button>
        </div>
        ${state.isEntryMenuOpen ? `
          <div class="entry-menu" role="menu" aria-label="Действия с записью">
            <button type="button" data-action="toggle-note" role="menuitem">${state.showMarginNote ? 'Скрыть полевую заметку' : 'Показать полевую заметку'}</button>
            <button type="button" data-action="jump-story" role="menuitem">Перейти к истории</button>
          </div>
        ` : ''}
      </header>

      <figure class="entry-hero">
        ${spriteImage(day.hero, 'entry-hero-image', day.title)}
        <figcaption>${day.quote}</figcaption>
      </figure>

      <div class="story-toolbar-wrap" id="story-toolbar-anchor">
        <div class="section-title-row">
          <span class="section-title">История</span>
          <span class="section-subtitle">Режим: ${toolbarActions.find((tool) => tool.id === state.activeTool)?.label ?? 'Текст'}</span>
        </div>

        <div class="writing-toolbar" aria-label="Панель редактора">
          ${toolbarActions.map((tool) => `
            <button type="button" data-tool="${tool.id}" class="${state.activeTool === tool.id ? 'is-active' : ''}" aria-label="${tool.label}" aria-pressed="${state.activeTool === tool.id}">${icon(tool.id)}</button>
          `).join('')}
        </div>
      </div>

      <div class="entry-body ${state.showMarginNote ? '' : 'entry-body--compact'}">
        <div class="entry-copy">
          ${day.body.map((paragraph) => `<p>${paragraph}</p>`).join('')}
        </div>

        ${state.showMarginNote ? `
          <aside class="margin-note">
            ${day.note.map((line) => `<p>${line}</p>`).join('')}
            <svg viewBox="0 0 120 68" aria-hidden="true"><path d="M6 61 30 39l14 10 21-28 15 22 14-12 20 30M19 62h93M72 42l7-22 10 25M29 38l6 23"/></svg>
          </aside>
        ` : ''}
      </div>

      <div class="ink-sketch" aria-hidden="true">
        <svg viewBox="0 0 610 165">
          <path d="M5 149h600M35 149l68-66 37 33 63-94 80 105 40-54 62 76M92 83l25 66M201 22l29 127M320 73l27 76M395 149c18-28 33-34 48-29 12 4 22 19 36 12 13-7 15-29 32-27 19 1 26 27 42 44M432 120l8-44 7 44M455 124l4-31 9 28M502 112l5-40 9 41"/>
          <path d="M122 149c30-12 55-17 80-15M262 148c18-7 38-9 61-7M477 149c25-7 50-5 83-1"/>
        </svg>
        <p>${day.footer}</p>
      </div>
    </article>
  `;
}

function charactersView() {
  return `
    <section class="placeholder-page character-index" aria-label="Список персонажей">
      <div class="page-corners" aria-hidden="true"></div>
      <header class="placeholder-header">
        <p class="kicker">Люди и спутники</p>
        <h1>Персонажи</h1>
        <p>Карточки тех, кого встретил путешественник.</p>
      </header>
      <div class="search-strip">
        ${icon('search')}
        <span>Поиск персонажей...</span>
        <button type="button" aria-label="Добавить персонажа">+</button>
      </div>
      <div class="character-list">
        ${data.characters.map((character) => `
          <button class="character-row ${character.id === state.selectedCharacterId ? 'is-current' : ''}" type="button" data-character="${character.id}">
            ${spriteImage(character.portrait, 'character-thumb')}
            <span>
              <strong>${character.name}</strong>
              <small>${character.meta}</small>
            </span>
            ${icon('arrow')}
          </button>
        `).join('')}
      </div>
      <div class="placeholder-ornament">${icon('feather')}</div>
    </section>
  `;
}

function characterDetail() {
  const character = getCurrentCharacter();

  return `
    <article class="placeholder-page character-card" aria-label="Карточка персонажа">
      <div class="page-corners" aria-hidden="true"></div>
      <p class="kicker">Запись о персонаже</p>
      <h2>${character.name}</h2>
      <p class="entry-date">${character.meta}</p>
      <div class="portrait-frame">${spriteImage(character.portrait, 'portrait-image', character.name)}</div>
      <div class="character-seal">${character.name[0]}</div>
      <h3>Заметки путешественника</h3>
      <p>${character.note}</p>
      <div class="rule-with-mark"><span></span>✦<span></span></div>
      <p class="handwritten">${character.hook}</p>
    </article>
  `;
}

function atlasView() {
  return `
    <section class="placeholder-page atlas-index" aria-label="Список записей атласа">
      <div class="page-corners" aria-hidden="true"></div>
      <header class="placeholder-header">
        <p class="kicker">Места, находки, легенды</p>
        <h1>Атлас</h1>
        <p>Личная энциклопедия мира, собранная по пути.</p>
      </header>
      <div class="atlas-grid">
        ${data.atlas.map((entry) => `
          <button class="atlas-tile ${entry.id === state.selectedAtlasId ? 'is-current' : ''}" type="button" data-atlas="${entry.id}">
            ${spriteImage(entry.image, 'atlas-tile-image')}
            <span class="atlas-type">${entry.subtitle.split('·')[0].trim()}</span>
            <strong>${entry.title}</strong>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function atlasDetail() {
  const entry = getCurrentAtlas();
  return `
    <article class="placeholder-page atlas-card" aria-label="Запись атласа">
      <div class="page-corners" aria-hidden="true"></div>
      <p class="kicker">Запись атласа</p>
      <h2>${entry.title}</h2>
      <p class="entry-date">${entry.subtitle}</p>
      <figure class="atlas-hero">${spriteImage(entry.image, 'atlas-hero-image', entry.title)}</figure>
      <p>${entry.description}</p>
      <div class="tag-row">${entry.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      <h3>Связанные записи</h3>
      <div class="linked-notes">${entry.links.map((link) => `<div class="linked-note">${link}</div>`).join('')}</div>
      <p class="handwritten atlas-script">Здесь заканчивается дорога, но начинается другое.</p>
    </article>
  `;
}

function spreadPages() {
  if (state.section === 'characters') {
    return `${charactersView()}${characterDetail()}`;
  }
  if (state.section === 'atlas') {
    return `${atlasView()}${atlasDetail()}`;
  }
  return `${campaignList()}${chronicleEntry()}`;
}

function render() {
  app.innerHTML = `
    <main class="scene">
      <div class="ambient ambient--left"></div>
      <div class="ambient ambient--right"></div>

      <header class="brand-plaque" aria-label="Путевой дневник">
        ${icon('compass')}
        <div><strong>Путевой дневник</strong><span>Миры. Люди. Истории.</span></div>
      </header>

      <section class="book-shell ${state.mobileDetail ? 'show-detail' : ''}" aria-label="Путевой дневник">
        <div class="book-cover"></div>
        <div class="book-spine" aria-hidden="true"><span></span><span></span><span></span></div>
        ${tabsMarkup()}
        <div class="paper-stack paper-stack--left"></div>
        <div class="paper-stack paper-stack--right"></div>
        <div class="book-spread">
          ${spreadPages()}
          <div class="gutter" aria-hidden="true"></div>
        </div>
      </section>

      <button class="mobile-back ${state.mobileDetail ? 'is-visible' : ''}" type="button" aria-label="Назад к списку">
        ${icon('back')} <span>Назад</span>
      </button>

      <footer class="scene-caption">
        <span class="device-marks">▱ ▯</span>
        <span><strong>Один мир. Везде с тобой.</strong><small>Настольные истории в цифровом дневнике</small></span>
      </footer>
    </main>
  `;

  document.querySelectorAll('[data-section]').forEach((button) => {
    button.addEventListener('click', () => {
      state.section = button.dataset.section;
      state.mobileDetail = false;
      state.isEntryMenuOpen = false;
      render();
    });
  });

  document.querySelectorAll('[data-day]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedDayId = Number(button.dataset.day);
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      state.isEntryMenuOpen = false;
      render();
    });
  });

  document.querySelectorAll('[data-character]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCharacterId = button.dataset.character;
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      render();
    });
  });

  document.querySelectorAll('[data-atlas]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedAtlasId = button.dataset.atlas;
      state.mobileDetail = window.matchMedia('(max-width: 760px)').matches;
      render();
    });
  });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'toggle-entry-menu') {
        state.isEntryMenuOpen = !state.isEntryMenuOpen;
        render();
        return;
      }
      if (action === 'toggle-bookmark') {
        state.isBookmarked = !state.isBookmarked;
        render();
        return;
      }
      if (action === 'toggle-note') {
        state.showMarginNote = !state.showMarginNote;
        state.isEntryMenuOpen = false;
        render();
        return;
      }
      if (action === 'jump-story') {
        state.isEntryMenuOpen = false;
        render();
        requestAnimationFrame(() => {
          document.querySelector('#story-toolbar-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });
  });

  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeTool = button.dataset.tool;
      render();
    });
  });

  document.querySelector('.mobile-back')?.addEventListener('click', () => {
    state.mobileDetail = false;
    state.isEntryMenuOpen = false;
    render();
  });
}

render();
