/**
 * FLOW - Task Creation, Editing, and Details Modal
 */

import { state } from '../state.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { confirmModal } from './confirmModal.js';
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from '../models.js';
import { escapeHtml } from '../utils.js';

class TaskModal {
  constructor() {
    this.modalEl = null;
    this.currentTaskId = null;
    this.tags = [];
  }

  ensureModal() {
    if (!this.modalEl) {
      this.modalEl = document.getElementById('modal-task');
      if (!this.modalEl) {
        this.modalEl = document.createElement('div');
        this.modalEl.id = 'modal-task';
        this.modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 hidden';
        this.modalEl.innerHTML = `
          <div class="modal-backdrop fixed inset-0 bg-black/75 backdrop-blur-xs opacity-0 transition-opacity"></div>
          <div class="modal-content relative w-full max-w-xl max-h-[90vh] flex flex-col bg-flow-surface-elevated border border-flow-border rounded-xl shadow-modal opacity-0 scale-95 transition-all overflow-hidden">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-flow-border">
              <h3 id="task-modal-title" class="text-base font-semibold text-flow-text-primary">Create New Task</h3>
              <button type="button" data-modal-close class="text-flow-text-muted hover:text-flow-text-primary p-1 rounded-lg hover:bg-flow-surface-hover transition-colors" aria-label="Close modal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <form id="task-form" class="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <!-- Title Field -->
              <div>
                <label for="task-input-title" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                  Task Title <span class="text-[#F87171]">*</span>
                </label>
                <input
                  type="text"
                  id="task-input-title"
                  required
                  placeholder="e.g. Audit checkout flow responsiveness"
                  class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3.5 py-2.5 text-flow-text-primary placeholder:text-flow-text-muted focus:outline-hidden transition-colors"
                />
                <p id="task-title-error" class="hidden text-xs text-[#F87171] mt-1">Please enter a task title.</p>
              </div>

              <!-- Description Field -->
              <div>
                <label for="task-input-desc" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  id="task-input-desc"
                  rows="3"
                  placeholder="Add notes, specifications, or acceptance criteria..."
                  class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3.5 py-2.5 text-flow-text-primary placeholder:text-flow-text-muted focus:outline-hidden transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Project and Status Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="task-select-project" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                    Associated Project <span class="text-[#F87171]">*</span>
                  </label>
                  <select
                    id="task-select-project"
                    required
                    class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3 py-2 text-flow-text-primary focus:outline-hidden transition-colors"
                  ></select>
                  <p id="task-project-error" class="hidden text-xs text-[#F87171] mt-1">Please select a project.</p>
                </div>

                <div>
                  <label for="task-select-status" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    id="task-select-status"
                    class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3 py-2 text-flow-text-primary focus:outline-hidden transition-colors"
                  >
                    <option value="${TASK_STATUSES.TODO}">${TASK_STATUS_LABELS[TASK_STATUSES.TODO]}</option>
                    <option value="${TASK_STATUSES.IN_PROGRESS}">${TASK_STATUS_LABELS[TASK_STATUSES.IN_PROGRESS]}</option>
                    <option value="${TASK_STATUSES.IN_REVIEW}">${TASK_STATUS_LABELS[TASK_STATUSES.IN_REVIEW]}</option>
                    <option value="${TASK_STATUSES.DONE}">${TASK_STATUS_LABELS[TASK_STATUSES.DONE]}</option>
                  </select>
                </div>
              </div>

              <!-- Priority and Due Date Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="task-select-priority" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    id="task-select-priority"
                    class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3 py-2 text-flow-text-primary focus:outline-hidden transition-colors"
                  >
                    <option value="${TASK_PRIORITIES.LOW}">${TASK_PRIORITY_LABELS[TASK_PRIORITIES.LOW]}</option>
                    <option value="${TASK_PRIORITIES.MEDIUM}">${TASK_PRIORITY_LABELS[TASK_PRIORITIES.MEDIUM]}</option>
                    <option value="${TASK_PRIORITIES.HIGH}">${TASK_PRIORITY_LABELS[TASK_PRIORITIES.HIGH]}</option>
                  </select>
                </div>

                <div>
                  <label for="task-input-duedate" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="task-input-duedate"
                    class="w-full bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3 py-2 text-flow-text-primary focus:outline-hidden transition-colors"
                  />
                </div>
              </div>

              <!-- Tags Field -->
              <div>
                <label class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                  Tags
                </label>
                <div class="flex flex-wrap gap-1.5 mb-2" id="task-tags-container"></div>
                <div class="flex gap-2">
                  <input
                    type="text"
                    id="task-input-tag"
                    placeholder="Type a tag and press Enter or click Add"
                    class="flex-1 bg-flow-surface-primary border border-flow-border focus:border-flow-accent rounded-lg px-3 py-1.5 text-xs text-flow-text-primary placeholder:text-flow-text-muted focus:outline-hidden transition-colors"
                  />
                  <button
                    type="button"
                    id="task-add-tag-btn"
                    class="px-3 py-1.5 bg-flow-surface-hover hover:bg-flow-border text-flow-text-primary text-xs rounded-lg transition-colors border border-flow-border"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>

            <!-- Modal Footer -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-flow-border bg-flow-surface-primary/50">
              <button
                type="button"
                id="task-delete-btn"
                class="hidden px-3.5 py-2 text-xs font-medium text-[#F87171] hover:bg-[#450A0A]/60 rounded-lg transition-colors border border-[#7F1D1D]/30"
              >
                Delete Task
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
                  form="task-form"
                  id="task-save-btn"
                  class="px-4 py-2 text-xs font-medium text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle font-semibold"
                >
                  Save Task
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
    const form = this.modalEl.querySelector('#task-form');
    const addTagBtn = this.modalEl.querySelector('#task-add-tag-btn');
    const tagInput = this.modalEl.querySelector('#task-input-tag');
    const deleteBtn = this.modalEl.querySelector('#task-delete-btn');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSave();
    });

    addTagBtn.addEventListener('click', () => this.addTagFromInput());
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addTagFromInput();
      }
    });

    deleteBtn.addEventListener('click', () => {
      if (!this.currentTaskId) return;
      const task = state.getTask(this.currentTaskId);
      if (!task) return;

      confirmModal.show({
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmStyle: 'danger',
        onConfirm: () => {
          modal.close(this.modalEl);
          state.deleteTask(task.id);
          toast.info(`Task "${task.title}" deleted.`);
        },
      });
    });
  }

  populateProjects(selectedProjectId = null) {
    const projectSelect = this.modalEl.querySelector('#task-select-project');
    const projects = state.projects;

    if (projects.length === 0) {
      projectSelect.innerHTML = '<option value="">No projects available</option>';
      return;
    }

    projectSelect.innerHTML = projects
      .map(
        (p) =>
          `<option value="${p.id}" ${p.id === selectedProjectId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
      )
      .join('');
  }

  renderTags() {
    const container = this.modalEl.querySelector('#task-tags-container');
    container.innerHTML = this.tags
      .map(
        (tag, idx) => `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-flow-surface-hover text-flow-text-secondary border border-flow-border">
          #${escapeHtml(tag)}
          <button type="button" data-tag-index="${idx}" class="text-flow-text-muted hover:text-flow-text-primary focus:outline-hidden">
            &times;
          </button>
        </span>
      `
      )
      .join('');

    container.querySelectorAll('button[data-tag-index]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.tagIndex);
        this.tags.splice(idx, 1);
        this.renderTags();
      });
    });
  }

  addTagFromInput() {
    const input = this.modalEl.querySelector('#task-input-tag');
    const val = input.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (val && !this.tags.includes(val)) {
      this.tags.push(val);
      this.renderTags();
    }
    input.value = '';
    input.focus();
  }

  openCreate(options = {}) {
    this.ensureModal();
    this.currentTaskId = null;
    this.tags = options.tags ? [...options.tags] : [];

    const titleEl = this.modalEl.querySelector('#task-modal-title');
    const form = this.modalEl.querySelector('#task-form');
    const deleteBtn = this.modalEl.querySelector('#task-delete-btn');
    const titleInput = this.modalEl.querySelector('#task-input-title');
    const descInput = this.modalEl.querySelector('#task-input-desc');
    const statusSelect = this.modalEl.querySelector('#task-select-status');
    const prioritySelect = this.modalEl.querySelector('#task-select-priority');
    const dueDateInput = this.modalEl.querySelector('#task-input-duedate');

    titleEl.textContent = 'Create New Task';
    deleteBtn.classList.add('hidden');
    form.reset();

    // Default project: from options, or current state.selectedProjectId, or first project
    const defaultProjectId = options.projectId || state.selectedProjectId || (state.projects[0] ? state.projects[0].id : null);
    this.populateProjects(defaultProjectId);

    if (options.status) statusSelect.value = options.status;
    else statusSelect.value = TASK_STATUSES.TODO;

    if (options.dueDate) dueDateInput.value = options.dueDate;
    if (options.priority) prioritySelect.value = options.priority;

    this.renderTags();
    this.clearErrors();

    modal.open(this.modalEl);
  }

  openEdit(taskId) {
    this.ensureModal();
    const task = state.getTask(taskId);
    if (!task) return;

    this.currentTaskId = taskId;
    this.tags = Array.isArray(task.tags) ? [...task.tags] : [];

    const titleEl = this.modalEl.querySelector('#task-modal-title');
    const deleteBtn = this.modalEl.querySelector('#task-delete-btn');
    const titleInput = this.modalEl.querySelector('#task-input-title');
    const descInput = this.modalEl.querySelector('#task-input-desc');
    const statusSelect = this.modalEl.querySelector('#task-select-status');
    const prioritySelect = this.modalEl.querySelector('#task-select-priority');
    const dueDateInput = this.modalEl.querySelector('#task-input-duedate');

    titleEl.textContent = 'Task Details & Edit';
    deleteBtn.classList.remove('hidden');

    this.populateProjects(task.projectId);
    titleInput.value = task.title;
    descInput.value = task.description || '';
    statusSelect.value = task.status;
    prioritySelect.value = task.priority;
    dueDateInput.value = task.dueDate || '';

    this.renderTags();
    this.clearErrors();

    modal.open(this.modalEl);
  }

  clearErrors() {
    this.modalEl.querySelector('#task-title-error').classList.add('hidden');
    this.modalEl.querySelector('#task-project-error').classList.add('hidden');
  }

  handleSave() {
    const titleInput = this.modalEl.querySelector('#task-input-title');
    const descInput = this.modalEl.querySelector('#task-input-desc');
    const projectSelect = this.modalEl.querySelector('#task-select-project');
    const statusSelect = this.modalEl.querySelector('#task-select-status');
    const prioritySelect = this.modalEl.querySelector('#task-select-priority');
    const dueDateInput = this.modalEl.querySelector('#task-input-duedate');

    const title = titleInput.value.trim();
    const projectId = projectSelect.value;

    let hasError = false;
    if (!title) {
      this.modalEl.querySelector('#task-title-error').classList.remove('hidden');
      hasError = true;
    } else {
      this.modalEl.querySelector('#task-title-error').classList.add('hidden');
    }

    if (!projectId) {
      this.modalEl.querySelector('#task-project-error').classList.remove('hidden');
      hasError = true;
    } else {
      this.modalEl.querySelector('#task-project-error').classList.add('hidden');
    }

    if (hasError) return;

    const taskData = {
      title,
      description: descInput.value.trim(),
      projectId,
      status: statusSelect.value,
      priority: prioritySelect.value,
      dueDate: dueDateInput.value || null,
      tags: this.tags,
    };

    if (this.currentTaskId) {
      state.updateTask(this.currentTaskId, taskData);
      toast.success(`Task updated.`);
    } else {
      state.createTask(taskData);
      toast.success(`Task "${title}" created.`);
    }

    modal.close(this.modalEl);
  }
}

export const taskModal = new TaskModal();
