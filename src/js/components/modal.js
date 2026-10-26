/**
 * FLOW - Modal Management Helper
 */

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.previousFocus = null;
    this.initGlobalListeners();
  }

  initGlobalListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close(this.activeModal);
      }
    });
  }

  open(modalId) {
    const modalEl = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!modalEl) return;

    if (this.activeModal && this.activeModal !== modalEl) {
      this.close(this.activeModal, false);
    }

    this.previousFocus = document.activeElement;
    this.activeModal = modalEl;

    modalEl.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    const backdrop = modalEl.querySelector('.modal-backdrop');
    const content = modalEl.querySelector('.modal-content');

    requestAnimationFrame(() => {
      if (backdrop) {
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
      }
      if (content) {
        content.classList.remove('opacity-0', 'scale-95');
        content.classList.add('opacity-100', 'scale-100');
      }

      // Focus first input or button
      const focusable = modalEl.querySelector('input, select, textarea, button:not([data-close])');
      if (focusable) {
        focusable.focus();
      }
    });

    // Close on backdrop click
    if (!modalEl.dataset.hasBackdropListener) {
      modalEl.addEventListener('click', (e) => {
        if (e.target.closest('[data-modal-close]') || e.target === modalEl || e.target.classList.contains('modal-backdrop')) {
          this.close(modalEl);
        }
      });
      modalEl.dataset.hasBackdropListener = 'true';
    }
  }

  close(modalId, restoreFocus = true) {
    const modalEl = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!modalEl) return;

    const backdrop = modalEl.querySelector('.modal-backdrop');
    const content = modalEl.querySelector('.modal-content');

    if (backdrop) {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0');
    }
    if (content) {
      content.classList.remove('opacity-100', 'scale-100');
      content.classList.add('opacity-0', 'scale-95');
    }

    setTimeout(() => {
      modalEl.classList.add('hidden');
      if (this.activeModal === modalEl) {
        this.activeModal = null;
        document.body.classList.remove('overflow-hidden');
      }

      if (restoreFocus && this.previousFocus && typeof this.previousFocus.focus === 'function') {
        this.previousFocus.focus();
      }
    }, 180);
  }
}

export const modal = new ModalManager();
