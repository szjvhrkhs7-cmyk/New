import { settingsStore } from '../../state/store.js';
import * as lock from '../security/webauthnLock.js';

export async function render(container, { setUiState }) {
  const settings = settingsStore.get();
  const available = await lock.isPlatformAuthenticatorAvailable();

  container.innerHTML = `
    <header class="card">
      <button class="link-btn" data-action="back">‹ Назад</button>
    </header>
    <section class="card">
      <h3>Безопасность</h3>
      <label class="switch-row">
        <span>Защита Face ID / Touch ID</span>
        <input type="checkbox" name="lock" ${settings.appLockEnabled ? 'checked' : ''} ${available ? '' : 'disabled'} />
      </label>
      ${available ? '' : '<p class="muted small">Биометрия недоступна в этом браузере или устройстве.</p>'}
      <p class="form-error" data-error hidden></p>
    </section>
    <section class="card">
      <h3>О приложении</h3>
      <p class="muted small">Финансовый планировщик — PWA для еженедельного планирования расходов. Все данные хранятся локально на устройстве.</p>
    </section>
  `;

  container.querySelector('[data-action="back"]').addEventListener('click', () => setUiState({ tab: 'expenses' }));

  const checkbox = container.querySelector('input[name="lock"]');
  checkbox.addEventListener('change', async () => {
    const errorEl = container.querySelector('[data-error]');
    errorEl.hidden = true;
    if (checkbox.checked) {
      try {
        await lock.registerCredential();
        settingsStore.set({ appLockEnabled: true });
      } catch {
        checkbox.checked = false;
        errorEl.textContent = 'Не удалось включить биометрическую защиту.';
        errorEl.hidden = false;
      }
    } else {
      lock.disable();
    }
  });
}
