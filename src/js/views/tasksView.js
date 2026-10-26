/**
 * FLOW - My Tasks Page View (Table / List with Multi-parameter Filtering & Sorting)
 */

import { state } from '../state.js';
import { taskModal } from '../components/taskModal.js';
import { confirmModal } from '../components/confirmModal.js';
import { toast } from '../components/toast.js';
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from '../models.js';
import {
  escapeHtml,
  getPriorityBadge,
  getStatusBadge,
  getDueDateDisplay,
  isOverdue,
  isDueToday,
  isDueThisWeek,
  formatShortDate,
} from '../utils.js';

export function renderTasksView(container) {
  const filter = state.taskFilter;

  // Filter tasks
  let tasks = state.tasks.filter((t) => {
    // Search
    if (filter.search) {
      const q = filter.search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description && t.description.toLowerCase().includes(q);
      const matchTag = t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // Project
    if (filter.project !== 'all' && t.projectId !== filter.project) return false;

    // Status
    if (filter.status !== 'all' && t.status !== filter.status) return false;

    // Priority
    if (filter.priority !== 'all' && t.priority !== filter.priority) return false;

    // Due Date
    if (filter.dueDate === 'overdue') {
      if (t.status === TASK_STATUSES.DONE || !isOverdue(t.dueDate, false)) return false;
    } else if (filter.dueDate === 'today') {
      if (!isDueToday(t.dueDate)) return false;
    } else if (filter.dueDate === 'this_week') {
      if (!isDueThisWeek(t.dueDate)) return false;
    } else if (filter.dueDate === 'no_date') {
      if (t.dueDate) return false;
    }

    return true;
  });

  // Sort tasks
  tasks.sort((a, b) => {
    if (filter.sort === 'due_date') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    } else if (filter.sort === 'priority') {
      const pWeights = { high: 0, medium: 1, low: 2 };
      return (pWeights[a.priority] || 2) - (pWeights[b.priority] || 2);
    } else if (filter.sort === 'title') {
      return a.title.localeCompare(b.title);
    } else if (filter.sort === 'updated') {
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    }
    return 0;
  });

  const totalFiltered = tasks.length;
  const completedFiltered = tasks.filter((t) => t.status === TASK_STATUSES.DONE).length;

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-flow-border/60 pb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-flow-text-primary">My Tasks</h1>
          <p class="text-sm text-flow-text-secondary mt-1">Review, prioritize, and track all assigned deliverables.</p>
        </div>

        <button id="tasks-btn-new" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle self-start sm:self-auto">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>New Task</span>
        </button>
      </div>

      <!-- Filter Controls Bar -->
      <div class="p-4 rounded-xl bg-flow-surface-primary border border-flow-border space-y-3">
        <!-- Search and Project Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <!-- Text Search -->
          <div class="lg:col-span-2 relative">
            <i data-lucide="search" class="w-4 h-4 text-flow-text-muted absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input
              type="text"
              id="tasks-filter-search"
              value="${escapeHtml(filter.search)}"
              placeholder="Search by title, description, or #tag..."
              class="w-full bg-flow-surface-elevated border border-flow-border focus:border-flow-accent rounded-lg pl-9 pr-3 py-2 text-xs text-flow-text-primary placeholder:text-flow-text-muted focus:outline-hidden transition-colors"
            />
          </div>

          <!-- Project Filter -->
          <div>
            <select
              id="tasks-filter-project"
              class="w-full bg-flow-surface-elevated border border-flow-border text-flow-text-primary text-xs rounded-lg px-3 py-2 focus:border-flow-accent focus:outline-hidden transition-colors"
            >
              <option value="all" ${filter.project === 'all' ? 'selected' : ''}>All Projects</option>
              ${state.projects
                .map(
                  (p) =>
                    `<option value="${p.id}" ${filter.project === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
                )
                .join('')}
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select
              id="tasks-filter-status"
              class="w-full bg-flow-surface-elevated border border-flow-border text-flow-text-primary text-xs rounded-lg px-3 py-2 focus:border-flow-accent focus:outline-hidden transition-colors"
            >
              <option value="all" ${filter.status === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="${TASK_STATUSES.TODO}" ${filter.status === TASK_STATUSES.TODO ? 'selected' : ''}>${TASK_STATUS_LABELS[TASK_STATUSES.TODO]}</option>
              <option value="${TASK_STATUSES.IN_PROGRESS}" ${filter.status === TASK_STATUSES.IN_PROGRESS ? 'selected' : ''}>${TASK_STATUS_LABELS[TASK_STATUSES.IN_PROGRESS]}</option>
              <option value="${TASK_STATUSES.IN_REVIEW}" ${filter.status === TASK_STATUSES.IN_REVIEW ? 'selected' : ''}>${TASK_STATUS_LABELS[TASK_STATUSES.IN_REVIEW]}</option>
              <option value="${TASK_STATUSES.DONE}" ${filter.status === TASK_STATUSES.DONE ? 'selected' : ''}>${TASK_STATUS_LABELS[TASK_STATUSES.DONE]}</option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div>
            <select
              id="tasks-filter-priority"
              class="w-full bg-flow-surface-elevated border border-flow-border text-flow-text-primary text-xs rounded-lg px-3 py-2 focus:border-flow-accent focus:outline-hidden transition-colors"
            >
              <option value="all" ${filter.priority === 'all' ? 'selected' : ''}>All Priorities</option>
              <option value="${TASK_PRIORITIES.HIGH}" ${filter.priority === TASK_PRIORITIES.HIGH ? 'selected' : ''}>High Priority</option>
              <option value="${TASK_PRIORITIES.MEDIUM}" ${filter.priority === TASK_PRIORITIES.MEDIUM ? 'selected' : ''}>Medium Priority</option>
              <option value="${TASK_PRIORITIES.LOW}" ${filter.priority === TASK_PRIORITIES.LOW ? 'selected' : ''}>Low Priority</option>
            </select>
          </div>
        </div>

        <!-- Second Filter Row: Due Date, Sort, and Reset -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-flow-border/50 text-xs">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-flow-text-muted">Due date:</span>
              <select
                id="tasks-filter-duedate"
                class="bg-flow-surface-elevated border border-flow-border text-flow-text-primary text-xs rounded-lg px-2.5 py-1.5 focus:border-flow-accent focus:outline-hidden transition-colors"
              >
                <option value="all" ${filter.dueDate === 'all' ? 'selected' : ''}>Any Due Date</option>
                <option value="overdue" ${filter.dueDate === 'overdue' ? 'selected' : ''}>Overdue</option>
                <option value="today" ${filter.dueDate === 'today' ? 'selected' : ''}>Due Today</option>
                <option value="this_week" ${filter.dueDate === 'this_week' ? 'selected' : ''}>Due This Week</option>
                <option value="no_date" ${filter.dueDate === 'no_date' ? 'selected' : ''}>No Due Date</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-flow-text-muted">Sort:</span>
              <select
                id="tasks-filter-sort"
                class="bg-flow-surface-elevated border border-flow-border text-flow-text-primary text-xs rounded-lg px-2.5 py-1.5 focus:border-flow-accent focus:outline-hidden transition-colors"
              >
                <option value="due_date" ${filter.sort === 'due_date' ? 'selected' : ''}>Due Date</option>
                <option value="priority" ${filter.sort === 'priority' ? 'selected' : ''}>Priority</option>
                <option value="title" ${filter.sort === 'title' ? 'selected' : ''}>Task Title</option>
                <option value="updated" ${filter.sort === 'updated' ? 'selected' : ''}>Recently Updated</option>
              </select>
            </div>

            ${
              filter.search || filter.project !== 'all' || filter.status !== 'all' || filter.priority !== 'all' || filter.dueDate !== 'all'
                ? `
              <button id="tasks-btn-reset-filters" class="text-flow-accent hover:underline text-xs flex items-center gap-1 font-medium">
                <i data-lucide="x" class="w-3.5 h-3.5"></i> Clear all filters
              </button>
            `
                : ''
            }
          </div>

          <div class="text-flow-text-muted text-xs">
            Showing <strong class="text-flow-text-primary font-mono">${totalFiltered}</strong> tasks
            (${completedFiltered} completed)
          </div>
        </div>
      </div>

      <!-- Tasks List / Table -->
      <div class="rounded-xl border border-flow-border bg-flow-surface-primary overflow-hidden">
        ${
          tasks.length === 0
            ? `
          <div class="py-16 text-center">
            <i data-lucide="inbox" class="w-10 h-10 mx-auto text-flow-text-muted mb-3 opacity-60"></i>
            <h3 class="text-sm font-semibold text-flow-text-primary">No tasks match the selected filters</h3>
            <p class="text-xs text-flow-text-secondary mt-1">Try clearing filters or add a new task to your workspace.</p>
            <button id="tasks-empty-reset-btn" class="mt-4 px-3.5 py-1.5 text-xs text-flow-accent hover:bg-flow-surface-hover rounded-lg border border-flow-border font-medium transition-colors">
              Reset Filters
            </button>
          </div>
        `
            : `
          <div class="divide-y divide-flow-border/50">
            ${tasks.map((t) => renderTaskTableRow(t)).join('')}
          </div>
        `
        }
      </div>
    </div>
  `;

  // Bind new task
  container.querySelector('#tasks-btn-new')?.addEventListener('click', () => {
    taskModal.openCreate();
  });

  // Bind filter inputs
  const searchInp = container.querySelector('#tasks-filter-search');
  searchInp?.addEventListener('input', () => {
    state.taskFilter.search = searchInp.value;
    renderTasksView(container);
  });

  const projSelect = container.querySelector('#tasks-filter-project');
  projSelect?.addEventListener('change', () => {
    state.taskFilter.project = projSelect.value;
    renderTasksView(container);
  });

  const statusSelect = container.querySelector('#tasks-filter-status');
  statusSelect?.addEventListener('change', () => {
    state.taskFilter.status = statusSelect.value;
    renderTasksView(container);
  });

  const prioritySelect = container.querySelector('#tasks-filter-priority');
  prioritySelect?.addEventListener('change', () => {
    state.taskFilter.priority = prioritySelect.value;
    renderTasksView(container);
  });

  const dueDateSelect = container.querySelector('#tasks-filter-duedate');
  dueDateSelect?.addEventListener('change', () => {
    state.taskFilter.dueDate = dueDateSelect.value;
    renderTasksView(container);
  });

  const sortSelect = container.querySelector('#tasks-filter-sort');
  sortSelect?.addEventListener('change', () => {
    state.taskFilter.sort = sortSelect.value;
    renderTasksView(container);
  });

  // Reset filters
  const resetBtn = container.querySelector('#tasks-btn-reset-filters');
  const emptyResetBtn = container.querySelector('#tasks-empty-reset-btn');
  const doReset = () => {
    state.taskFilter = {
      search: '',
      project: 'all',
      status: 'all',
      priority: 'all',
      dueDate: 'all',
      sort: 'due_date',
    };
    renderTasksView(container);
  };
  resetBtn?.addEventListener('click', doReset);
  emptyResetBtn?.addEventListener('click', doReset);

  // Toggle completion
  container.querySelectorAll('[data-task-toggle-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.toggleTaskComplete(btn.dataset.taskToggleId);
    });
  });

  // Open task edit
  container.querySelectorAll('[data-task-row-id]').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      taskModal.openEdit(row.dataset.taskRowId);
    });
  });

  // Edit action button
  container.querySelectorAll('[data-edit-task-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      taskModal.openEdit(btn.dataset.editTaskId);
    });
  });

  // Delete action button
  container.querySelectorAll('[data-delete-task-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.dataset.deleteTaskId;
      const task = state.getTask(taskId);
      if (!task) return;

      confirmModal.show({
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"?`,
        confirmText: 'Delete Task',
        confirmStyle: 'danger',
        onConfirm: () => {
          state.deleteTask(taskId);
          toast.info(`Task "${task.title}" deleted.`);
        },
      });
    });
  });
}

function renderTaskTableRow(task) {
  const project = state.getProject(task.projectId);
  const isDone = task.status === TASK_STATUSES.DONE;

  return `
    <div
      data-task-row-id="${task.id}"
      class="group task-row flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-flow-surface-hover/50 transition-colors gap-3 cursor-pointer"
    >
      <!-- Left: Checkbox & Title -->
      <div class="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
        <button
          type="button"
          data-task-toggle-id="${task.id}"
          class="w-4 h-4 rounded-sm border ${
            isDone ? 'bg-[#064E3B] border-[#059669]' : 'border-flow-border hover:border-flow-accent'
          } flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Toggle task status"
        >
          <i data-lucide="check" class="w-3 h-3 ${isDone ? 'text-[#34D399]' : 'text-transparent group-hover:text-flow-text-muted/40'}"></i>
        </button>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium ${isDone ? 'line-through text-flow-text-muted' : 'text-flow-text-primary group-hover:text-flow-accent'} transition-colors truncate">
              ${escapeHtml(task.title)}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs text-flow-text-muted mt-1">
            ${
              project
                ? `
              <span class="flex items-center gap-1.5 font-medium text-flow-text-secondary">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${project.color || '#8AB4F8'};"></span>
                <span>${escapeHtml(project.name)}</span>
              </span>
              <span>•</span>
            `
                : ''
            }
            <span>${getDueDateDisplay(task.dueDate, isDone)}</span>

            ${
              task.tags && task.tags.length > 0
                ? `
              <span>•</span>
              <div class="flex items-center gap-1">
                ${task.tags
                  .slice(0, 2)
                  .map(
                    (tag) => `
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-flow-surface-elevated text-flow-text-muted">
                    #${escapeHtml(tag)}
                  </span>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
          </div>
        </div>
      </div>

      <!-- Right: Status, Priority & Quick Actions -->
      <div class="flex items-center gap-4 flex-shrink-0 self-end sm:self-center">
        ${getStatusBadge(task.status)}
        ${getPriorityBadge(task.priority)}

        <div class="flex items-center gap-1 ml-2">
          <button
            type="button"
            data-edit-task-id="${task.id}"
            class="p-1.5 text-flow-text-muted hover:text-flow-text-primary hover:bg-flow-surface-elevated rounded-md transition-colors"
            title="Edit task"
          >
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button
            type="button"
            data-delete-task-id="${task.id}"
            class="p-1.5 text-flow-text-muted hover:text-[#F87171] hover:bg-[#450A0A]/40 rounded-md transition-colors"
            title="Delete task"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}
