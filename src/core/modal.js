export function openModal(innerHTML, { onMount, className = '' } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal-sheet ${className}">${innerHTML}</div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  function close() {
    overlay.remove();
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const sheet = overlay.querySelector('.modal-sheet');
  onMount?.(sheet, close);
  return close;
}
