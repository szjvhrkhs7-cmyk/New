import * as lock from './webauthnLock.js';

export function showLockScreen(onUnlock) {
  const overlay = document.createElement('div');
  overlay.className = 'lock-overlay';
  overlay.innerHTML = `
    <div class="lock-content">
      <div class="lock-icon">🔒</div>
      <p>Финансовый планировщик заблокирован</p>
      <button class="btn primary" data-action="unlock">Разблокировать</button>
      <p class="form-error" data-error hidden></p>
    </div>
  `;
  document.body.appendChild(overlay);

  async function attempt() {
    const ok = await lock.verify();
    if (ok) {
      overlay.remove();
      onUnlock();
    } else {
      overlay.querySelector('[data-error]').textContent = 'Не удалось подтвердить личность.';
      overlay.querySelector('[data-error]').hidden = false;
    }
  }

  overlay.querySelector('[data-action="unlock"]').addEventListener('click', attempt);
  attempt();
}
