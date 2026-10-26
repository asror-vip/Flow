/**
 * FLOW - Toast Notification Manager
 */

class ToastManager {
  constructor() {
    this.container = null;
  }

  ensureContainer() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0';
        document.body.appendChild(this.container);
      }
    }
  }

  show({ message, type = 'info', duration = 3000 }) {
    this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border text-sm shadow-modal transition-all duration-200 transform translate-y-2 opacity-0 bg-flow-surface-elevated ${
      type === 'success'
        ? 'border-flow-status-success/40 text-flow-text-primary'
        : type === 'error'
        ? 'border-flow-status-error/40 text-flow-text-primary'
        : type === 'warning'
        ? 'border-flow-status-warning/40 text-flow-text-primary'
        : 'border-flow-border text-flow-text-primary'
    }`;

    let iconHtml = '';
    if (type === 'success') {
      iconHtml = '<span class="text-flow-status-success flex-shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></span>';
    } else if (type === 'error') {
      iconHtml = '<span class="text-flow-status-error flex-shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></span>';
    } else if (type === 'warning') {
      iconHtml = '<span class="text-flow-status-warning flex-shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></span>';
    } else {
      iconHtml = '<span class="text-flow-accent flex-shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>';
    }

    toast.innerHTML = `
      ${iconHtml}
      <span class="flex-1 text-sm">${message}</span>
      <button class="text-flow-text-muted hover:text-flow-text-primary p-0.5 rounded transition-colors" aria-label="Dismiss toast">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  }

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  }

  success(message, duration) {
    this.show({ message, type: 'success', duration });
  }

  error(message, duration) {
    this.show({ message, type: 'error', duration });
  }

  warning(message, duration) {
    this.show({ message, type: 'warning', duration });
  }

  info(message, duration) {
    this.show({ message, type: 'info', duration });
  }
}

export const toast = new ToastManager();
