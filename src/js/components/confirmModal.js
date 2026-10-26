/**
 * FLOW - Confirmation Dialog Component
 */

import { modal } from './modal.js';

class ConfirmModal {
  constructor() {
    this.modalEl = null;
    this.callback = null;
  }

  ensureModal() {
    if (!this.modalEl) {
      this.modalEl = document.getElementById('modal-confirm');
      if (!this.modalEl) {
        this.modalEl = document.createElement('div');
        this.modalEl.id = 'modal-confirm';
        this.modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 hidden';
        this.modalEl.innerHTML = `
          <div class="modal-backdrop fixed inset-0 bg-black/75 backdrop-blur-xs opacity-0 transition-opacity"></div>
          <div class="modal-content relative w-full max-w-md bg-flow-surface-elevated border border-flow-border rounded-xl p-6 shadow-modal opacity-0 scale-95 transition-all">
            <div class="flex items-start gap-4">
              <div id="confirm-icon-container" class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#450A0A] text-[#F87171] border border-[#7F1D1D]/40">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div class="flex-1">
                <h3 id="confirm-title" class="text-base font-semibold text-flow-text-primary">Confirm Action</h3>
                <p id="confirm-message" class="text-sm text-flow-text-secondary mt-1.5 leading-relaxed">Are you sure you want to proceed?</p>
              </div>
            </div>
            <div class="mt-6 flex items-center justify-end gap-3">
              <button type="button" data-modal-close class="px-4 py-2 text-sm font-medium text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover rounded-lg border border-flow-border transition-colors">
                Cancel
              </button>
              <button id="confirm-action-btn" type="button" class="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-[#DC2626] hover:bg-[#B91C1C] text-white">
                Delete
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(this.modalEl);

        const actionBtn = this.modalEl.querySelector('#confirm-action-btn');
        actionBtn.addEventListener('click', () => {
          if (typeof this.callback === 'function') {
            this.callback();
          }
          modal.close(this.modalEl);
        });
      }
    }
  }

  show({
    title = 'Confirm Action',
    message = 'Are you sure you want to perform this action?',
    confirmText = 'Confirm',
    confirmStyle = 'danger', // 'danger' | 'primary'
    onConfirm = () => {},
  }) {
    this.ensureModal();
    this.callback = onConfirm;

    const titleEl = this.modalEl.querySelector('#confirm-title');
    const messageEl = this.modalEl.querySelector('#confirm-message');
    const actionBtn = this.modalEl.querySelector('#confirm-action-btn');
    const iconContainer = this.modalEl.querySelector('#confirm-icon-container');

    titleEl.textContent = title;
    messageEl.textContent = message;
    actionBtn.textContent = confirmText;

    if (confirmStyle === 'danger') {
      actionBtn.className = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-[#DC2626] hover:bg-[#EF4444] text-white';
      iconContainer.className = 'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#450A0A] text-[#F87171] border border-[#7F1D1D]/40';
      iconContainer.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
    } else {
      actionBtn.className = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-flow-accent hover:bg-flow-accent-hover text-black';
      iconContainer.className = 'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-flow-accent-subtle text-flow-accent border border-flow-accent/40';
      iconContainer.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    }

    modal.open(this.modalEl);
  }
}

export const confirmModal = new ConfirmModal();
