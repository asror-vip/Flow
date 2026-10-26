/**
 * FLOW - Project Detail View
 */

import { state } from '../state.js';
import { taskModal } from '../components/taskModal.js';
import { projectModal } from '../components/projectModal.js';
import { confirmModal } from '../components/confirmModal.js';
import { toast } from '../components/toast.js';
import {
  escapeHtml,
  getPriorityBadge,
  getStatusBadge,
  getDueDateDisplay,
  getProjectStatusBadge,
  formatDateString,
  timeAgo,
} from '../utils.js';

export function renderProjectDetailView(container, projectId) {
  const project = state.getProject(projectId);

  if (!project) {
    container.innerHTML = `
      <div class="py-20 text-center animate-fadeIn">
        <i data-lucide="alert-circle" class="w-12 h-12 mx-auto text-[#F87171] mb-3"></i>
        <h2 class="text-lg font-semibold text-flow-text-primary">Project Not Found</h2>
        <p class="text-sm text-flow-text-secondary mt-1">The requested project may have been deleted or the link is invalid.</p>
        <a href="#projects" class="inline-flex items-center gap-2 mt-5 px-4 py-2 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Return to Projects</span>
        </a>
      </div>
    `;
    return;
  }

  const allTasks = state.getTasksForProject(projectId);
  const progress = state.getProjectProgress(projectId);

  const todoCount = allTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'in_progress').length;
  const inReviewCount = allTasks.filter((t) => t.status === 'in_review').length;
  const doneCount = allTasks.filter((t) => t.status === 'done').length;

  const projectActivities = state.activities.filter((a) => a.projectId === projectId);

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs text-flow-text-muted" aria-label="Breadcrumb">
        <a href="#projects" class="hover:text-flow-text-primary transition-colors flex items-center gap-1">
          <i data-lucide="folder" class="w-3.5 h-3.5"></i>
          <span>Projects</span>
        </a>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        <span class="text-flow-text-primary font-medium truncate">${escapeHtml(project.name)}</span>
      </nav>

      <!-- Project Header Card -->
      <div class="p-6 rounded-xl bg-flow-surface-primary border border-flow-border">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <span class="w-4 h-4 rounded-full mt-1.5 flex-shrink-0" style="background-color: ${project.color || '#8AB4F8'};"></span>
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h1 class="text-2xl font-bold tracking-tight text-flow-text-primary">${escapeHtml(project.name)}</h1>
                ${getProjectStatusBadge(project.status)}
              </div>
              <p class="text-sm text-flow-text-secondary mt-2 max-w-2xl leading-relaxed">
                ${project.description ? escapeHtml(project.description) : 'No description provided for this project.'}
              </p>

              <div class="flex flex-wrap items-center gap-4 mt-4 text-xs text-flow-text-muted">
                <span>Start: <strong class="text-flow-text-secondary">${project.startDate ? formatDateString(project.startDate) : 'Not specified'}</strong></span>
                <span>•</span>
                <span>Deadline: <strong class="text-flow-text-secondary">${project.deadline ? formatDateString(project.deadline) : 'Not specified'}</strong></span>
                <span>•</span>
                <span>Created: <strong class="text-flow-text-secondary">${formatDateString(project.createdAt.split('T')[0])}</strong></span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-start lg:self-auto">
            <button
              id="proj-detail-edit-btn"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-flow-text-secondary hover:text-flow-text-primary bg-flow-surface-elevated hover:bg-flow-surface-hover rounded-lg border border-flow-border transition-colors"
            >
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>Edit</span>
            </button>
            <button
              id="proj-detail-delete-btn"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F87171] hover:bg-[#450A0A]/40 rounded-lg border border-[#7F1D1D]/30 transition-colors"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Delete</span>
            </button>
            <button
              id="proj-detail-add-task-btn"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle ml-1"
            >
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        <!-- Progress Overview Bar -->
        <div class="mt-6 pt-5 border-t border-flow-border/50">
          <div class="flex items-center justify-between text-xs mb-2">
            <div class="flex items-center gap-4">
              <span class="text-flow-text-primary font-medium">Completion Progress</span>
              <span class="text-flow-text-muted">${progress.completed} of ${progress.total} tasks completed</span>
            </div>
            <span class="text-sm font-bold text-flow-text-primary font-mono">${progress.percentage}%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-flow-surface-elevated overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              style="width: ${progress.percentage}%; background-color: ${project.color || '#8AB4F8'};"
            ></div>
          </div>

          <!-- Status Counts Pill Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div class="p-2.5 rounded-lg bg-flow-surface-elevated border border-flow-border flex items-center justify-between">
              <span class="text-flow-text-muted">To Do</span>
              <span class="font-semibold text-flow-text-primary font-mono">${todoCount}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-flow-surface-elevated border border-flow-border flex items-center justify-between">
              <span class="text-flow-text-muted">In Progress</span>
              <span class="font-semibold text-[#8AB4F8] font-mono">${inProgressCount}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-flow-surface-elevated border border-flow-border flex items-center justify-between">
              <span class="text-flow-text-muted">In Review</span>
              <span class="font-semibold text-[#A78BFA] font-mono">${inReviewCount}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-flow-surface-elevated border border-flow-border flex items-center justify-between">
              <span class="text-flow-text-muted">Done</span>
              <span class="font-semibold text-[#34D399] font-mono">${doneCount}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Tasks and Activity Split -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tasks Column (2 cols) -->
        <div class="lg:col-span-2 p-6 rounded-xl bg-flow-surface-primary border border-flow-border">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-flow-text-primary">Associated Tasks</h2>
            <button
              id="proj-detail-add-task-sub-btn"
              class="text-xs text-flow-accent hover:text-flow-accent-hover font-medium flex items-center gap-1"
            >
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Task</span>
            </button>
          </div>

          <div class="divide-y divide-flow-border/40">
            ${renderProjectTasksList(allTasks)}
          </div>
        </div>

        <!-- Project Activity Feed (1 col) -->
        <div class="p-6 rounded-xl bg-flow-surface-primary border border-flow-border flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-flow-text-primary">Project History</h2>
            <span class="text-[11px] text-flow-text-muted">Activities</span>
          </div>

          <div class="space-y-4 flex-1 overflow-y-auto max-h-96 pr-1">
            ${renderProjectActivities(projectActivities)}
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Header actions
  container.querySelector('#proj-detail-edit-btn')?.addEventListener('click', () => {
    projectModal.openEdit(projectId);
  });

  container.querySelector('#proj-detail-delete-btn')?.addEventListener('click', () => {
    confirmModal.show({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}" and all ${allTasks.length} associated tasks?`,
      confirmText: 'Delete Project',
      confirmStyle: 'danger',
      onConfirm: () => {
        state.deleteProject(projectId);
        toast.info(`Project "${project.name}" deleted.`);
        window.location.hash = '#projects';
      },
    });
  });

  const openAddTask = () => {
    taskModal.openCreate({ projectId });
  };

  container.querySelector('#proj-detail-add-task-btn')?.addEventListener('click', openAddTask);
  container.querySelector('#proj-detail-add-task-sub-btn')?.addEventListener('click', openAddTask);

  // Bind Task Checkbox and Detail clicks
  container.querySelectorAll('[data-task-toggle-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.toggleTaskComplete(btn.dataset.taskToggleId);
    });
  });

  container.querySelectorAll('[data-task-item-id]').forEach((row) => {
    row.addEventListener('click', () => {
      taskModal.openEdit(row.dataset.taskItemId);
    });
  });
}

function renderProjectTasksList(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="py-12 text-center text-flow-text-muted text-xs">
        <i data-lucide="check-square" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        No tasks assigned to this project yet.
      </div>
    `;
  }

  return tasks
    .map((t) => {
      const isDone = t.status === 'done';
      return `
      <div
        data-task-item-id="${t.id}"
        class="group flex items-center justify-between py-3.5 px-2 hover:bg-flow-surface-hover/50 rounded-lg cursor-pointer transition-colors"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1 pr-3">
          <button
            type="button"
            data-task-toggle-id="${t.id}"
            class="w-4 h-4 rounded-sm border ${isDone ? 'bg-[#064E3B] border-[#059669]' : 'border-flow-border hover:border-flow-accent'} flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Toggle task completion"
          >
            <i data-lucide="check" class="w-3 h-3 ${isDone ? 'text-[#34D399]' : 'text-transparent group-hover:text-flow-text-muted/40'}"></i>
          </button>
          <div class="min-w-0 flex-1">
            <span class="text-sm font-medium ${isDone ? 'line-through text-flow-text-muted' : 'text-flow-text-primary group-hover:text-flow-accent'} transition-colors truncate block">
              ${escapeHtml(t.title)}
            </span>
            <div class="flex items-center gap-2 text-xs text-flow-text-muted mt-0.5">
              <span>${getDueDateDisplay(t.dueDate, isDone)}</span>
              ${t.tags && t.tags.length > 0 ? `<span>•</span><span>#${escapeHtml(t.tags[0])}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0">
          ${getPriorityBadge(t.priority)}
          ${getStatusBadge(t.status)}
        </div>
      </div>
    `;
    })
    .join('');
}

function renderProjectActivities(activities) {
  if (activities.length === 0) {
    return `<div class="py-8 text-center text-flow-text-muted text-xs">No activity logged for this project yet.</div>`;
  }

  return activities
    .map((act) => `
    <div class="flex items-start gap-3 text-xs">
      <div class="w-6 h-6 rounded-full bg-flow-surface-elevated flex items-center justify-center flex-shrink-0 border border-flow-border text-flow-accent mt-0.5">
        <i data-lucide="activity" class="w-3 h-3"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-flow-text-primary leading-tight font-medium">${escapeHtml(act.title)}</p>
        <span class="text-[11px] text-flow-text-muted mt-0.5 block">${timeAgo(act.timestamp)}</span>
      </div>
    </div>
  `)
    .join('');
}
