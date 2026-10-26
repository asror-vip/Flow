/**
 * FLOW - Project Creation and Editing Modal
 */

import { state } from '../state.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { confirmModal } from './confirmModal.js';
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  PROJECT_COLORS,
} from '../models.js';

class ProjectModal {
  constructor() {
    this.modalEl = null;
    this.currentProjectId = null;
    this.selectedColor = PROJECT_COLORS[0];
  }

  ensureModal() {
    if (!this.modalEl) {
      this.modalEl = document.getElementById('modal-project');
      if (!this.modalEl) {
        this.modalEl = document.createElement('div');
        this.modalEl.id = 'modal-project';
        this.modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 hidden';
        this.modalEl.innerHTML = `
          <div class="modal-backdrop fixed inset-0 bg-black/75 backdrop-blur-xs opacity-0 transition-opacity"></div>
          <div class="modal-content relative w-full max-w-lg flex flex-col bg-flow-surface-elevated border border-flow-border rounded-xl shadow-modal opacity-0 scale-95 transition-all overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-flow-border">
              <h3 id="project-modal-title" class="text-base font-semibold text-flow-text-primary">New Project</h3>
              <button type="button" data-modal-close class="text-flow-text-muted hover:text-flow-text-primary p-1 rounded-lg hover:bg-flow-surface-hover transition-colors" aria-label="Close modal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Form -->
            <form id="project-form" class="p-6 space-y-4 text-sm flex-1">
              <div>
                <label for="project-input-name" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                  Project Name <span class="text-[#F87171]">*</span>
                </label>
                <input
                  type="text"
                  id="project-input-name"
                  required
                  placeholder="e.g. Design System V2"
                  class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3.5 py-2.5 text-flow-text-primary placeholder:text-flow-text-muted focus:outline-hidden transition-colors"
                />
                <p id="project-name-error" class="hidden text-xs text-[#F87171] mt-1">Please enter a project name.</p>
              </div>

              <div>
                <label for="project-input-desc" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  id="project-input-desc"
                  rows="3"
                  placeholder="Brief overview of project scope and milestones..."
                  class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3.5 py-2.5 text-flow-text-primary placeholder:text-flow-text-muted focus:outline-hidden transition-colors resize-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="project-select-status" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    id="project-select-status"
                    class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3 py-2 text-flow-text-primary focus:outline-hidden transition-colors"
                  >
                    <option value="${PROJECT_STATUSES.ACTIVE}">${PROJECT_STATUS_LABELS[PROJECT_STATUSES.ACTIVE]}</option>
                    <option value="${PROJECT_STATUSES.ON_HOLD}">${PROJECT_STATUS_LABELS[PROJECT_STATUSES.ON_HOLD]}</option>
                    <option value="${PROJECT_STATUSES.COMPLETED}">${PROJECT_STATUS_LABELS[PROJECT_STATUSES.COMPLETED]}</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                    Color Accent
                  </label>
                  <div class="flex items-center gap-2 pt-1" id="project-colors-picker"></div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="project-input-startdate" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="project-input-startdate"
                    class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3 py-2 text-flow-text-primary focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label for="project-input-deadline" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    id="project-input-deadline"
                    class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3 py-2 text-flow-text-primary focus:outline-hidden transition-colors"
                  />
                </div>
              </div>
            </form>

            <!-- Footer -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-flow-border bg-flow-surface-primary/50">
              <button
                type="button"
                id="project-delete-btn"
                class="hidden px-3.5 py-2 text-xs font-medium text-[#F87171] hover:bg-[#450A0A]/60 rounded-lg transition-colors border border-[#7F1D1D]/30"
              >
                Delete Project
              </button>
              <div class="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  data-modal-close
                  class="px-4 py-2 text-xs font-medium text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover rounded-lg border border-flow-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="project-form"
                  class="px-4 py-2 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(this.modalEl);
        this.bindEvents();
      }
    }
  }

  bindEvents() {
    const form = this.modalEl.querySelector('#project-form');
    const deleteBtn = this.modalEl.querySelector('#project-delete-btn');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });

    deleteBtn.addEventListener('click', () => {
      if (!this.currentProjectId) return;
      const project = state.getProject(this.currentProjectId);
      if (!project) return;

      const associatedTasksCount = state.getTasksForProject(project.id).length;
      const taskWarning = associatedTasksCount > 0
        ? ` This will also delete ${associatedTasksCount} associated task${associatedTasksCount > 1 ? 's' : ''}.`
        : '';

      confirmModal.show({
        title: 'Delete Project',
        message: `Are you sure you want to delete "${project.name}"?${taskWarning} This action cannot be undone.`,
        confirmText: 'Delete Project',
        confirmStyle: 'danger',
        onConfirm: () => {
          modal.close(this.modalEl);
          state.deleteProject(project.id);
          toast.info(`Project "${project.name}" deleted.`);
          if (state.currentView === 'project_detail') {
            window.location.hash = '#projects';
          }
        },
      });
    });
  }

  renderColorPicker() {
    const picker = this.modalEl.querySelector('#project-colors-picker');
    picker.innerHTML = PROJECT_COLORS.map(
      (color) => `
      <button
        type="button"
        data-color="${color}"
        style="background-color: ${color};"
        class="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-hidden ${
          this.selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-flow-surface-elevated scale-110' : 'opacity-80'
        }"
        aria-label="Color ${color}"
      ></button>
    `
    ).join('');

    picker.querySelectorAll('button[data-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedColor = btn.dataset.color;
        this.renderColorPicker();
      });
    });
  }

  openCreate() {
    this.ensureModal();
    this.currentProjectId = null;
    this.selectedColor = PROJECT_COLORS[0];

    const titleEl = this.modalEl.querySelector('#project-modal-title');
    const deleteBtn = this.modalEl.querySelector('#project-delete-btn');
    const form = this.modalEl.querySelector('#project-form');

    titleEl.textContent = 'Create New Project';
    deleteBtn.classList.add('hidden');
    form.reset();

    this.renderColorPicker();
    this.modalEl.querySelector('#project-name-error').classList.add('hidden');

    modal.open(this.modalEl);
  }

  openEdit(projectId) {
    this.ensureModal();
    const project = state.getProject(projectId);
    if (!project) return;

    this.currentProjectId = projectId;
    this.selectedColor = project.color || PROJECT_COLORS[0];

    const titleEl = this.modalEl.querySelector('#project-modal-title');
    const deleteBtn = this.modalEl.querySelector('#project-delete-btn');
    const nameInput = this.modalEl.querySelector('#project-input-name');
    const descInput = this.modalEl.querySelector('#project-input-desc');
    const statusSelect = this.modalEl.querySelector('#project-select-status');
    const startDateInput = this.modalEl.querySelector('#project-input-startdate');
    const deadlineInput = this.modalEl.querySelector('#project-input-deadline');

    titleEl.textContent = 'Edit Project';
    deleteBtn.classList.remove('hidden');

    nameInput.value = project.name;
    descInput.value = project.description || '';
    statusSelect.value = project.status;
    startDateInput.value = project.startDate || '';
    deadlineInput.value = project.deadline || '';

    this.renderColorPicker();
    this.modalEl.querySelector('#project-name-error').classList.add('hidden');

    modal.open(this.modalEl);
  }

  handleSave() {
    const nameInput = this.modalEl.querySelector('#project-input-name');
    const descInput = this.modalEl.querySelector('#project-input-desc');
    const statusSelect = this.modalEl.querySelector('#project-select-status');
    const startDateInput = this.modalEl.querySelector('#project-input-startdate');
    const deadlineInput = this.modalEl.querySelector('#project-input-deadline');

    const name = nameInput.value.trim();
    if (!name) {
      this.modalEl.querySelector('#project-name-error').classList.remove('hidden');
      return;
    }
    this.modalEl.querySelector('#project-name-error').classList.add('hidden');

    const projectData = {
      name,
      description: descInput.value.trim(),
      status: statusSelect.value,
      startDate: startDateInput.value || null,
      deadline: deadlineInput.value || null,
      color: this.selectedColor,
    };

    if (this.currentProjectId) {
      state.updateProject(this.currentProjectId, projectData);
      toast.success(`Project updated.`);
    } else {
      const created = state.createProject(projectData);
      toast.success(`Project "${name}" created.`);
    }

    modal.close(this.modalEl);
  }
}

export const projectModal = new ProjectModal();
