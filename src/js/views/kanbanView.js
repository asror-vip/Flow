/**
 * FLOW - Kanban Task Board View (HTML5 Drag & Drop + Accessible Controls)
 */

import { state } from '../state.js';
import { taskModal } from '../components/taskModal.js';
import { toast } from '../components/toast.js';
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '../models.js';
import {
  escapeHtml,
  getPriorityBadge,
  getDueDateDisplay,
  formatShortDate,
} from '../utils.js';

let draggedTaskId = null;
let currentDropTargetTaskId = null;
let selectedProjectFilter = 'all';

export function renderKanbanView(container) {
  // Filter tasks if project filter selected
  const tasks = state.tasks.filter((t) => {
    if (selectedProjectFilter !== 'all' && t.projectId !== selectedProjectFilter) {
      return false;
    }
    return true;
  });

  const columns = [
    { id: TASK_STATUSES.TODO, label: TASK_STATUS_LABELS[TASK_STATUSES.TODO], color: '#9CA3AF' },
    { id: TASK_STATUSES.IN_PROGRESS, label: TASK_STATUS_LABELS[TASK_STATUSES.IN_PROGRESS], color: '#8AB4F8' },
    { id: TASK_STATUSES.IN_REVIEW, label: TASK_STATUS_LABELS[TASK_STATUSES.IN_REVIEW], color: '#A78BFA' },
    { id: TASK_STATUSES.DONE, label: TASK_STATUS_LABELS[TASK_STATUSES.DONE], color: '#34D399' },
  ];

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      <!-- Board Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-flow-border/60 pb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-flow-text-primary">Kanban Board</h1>
          <p class="text-sm text-flow-text-secondary mt-1">Drag and drop tasks between workflow stages. Real-time status sync.</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Project Filter Dropdown -->
          <div class="relative">
            <select
              id="kanban-filter-project"
              class="bg-flow-surface-elevated border border-flow-border text-flow-text-primary text-xs rounded-lg px-3 py-2 pr-8 focus:border-flow-accent focus:outline-hidden transition-colors"
            >
              <option value="all" ${selectedProjectFilter === 'all' ? 'selected' : ''}>All Projects</option>
              ${state.projects
                .map(
                  (p) =>
                    `<option value="${p.id}" ${selectedProjectFilter === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
                )
                .join('')}
            </select>
          </div>

          <button id="kanban-btn-new-task" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>New Task</span>
          </button>
        </div>
      </div>

      <!-- Kanban 4 Columns Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start pb-8">
        ${columns
          .map((col) => {
            const colTasks = tasks
              .filter((t) => t.status === col.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0));

            return `
            <div
              class="kanban-column flex flex-col rounded-xl bg-flow-surface-primary border border-flow-border min-h-[550px] max-h-[calc(100vh-210px)] overflow-hidden transition-colors"
              data-column-status="${col.id}"
            >
              <!-- Column Header -->
              <div class="flex items-center justify-between p-3.5 border-b border-flow-border/70 bg-flow-surface-primary">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${col.color};"></span>
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-flow-text-primary">${col.label}</h3>
                  <span class="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-flow-surface-elevated text-flow-text-muted border border-flow-border">
                    ${colTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  data-add-to-column="${col.id}"
                  class="p-1 text-flow-text-muted hover:text-flow-text-primary hover:bg-flow-surface-hover rounded-md transition-colors"
                  title="Add task to ${col.label}"
                >
                  <i data-lucide="plus" class="w-4 h-4"></i>
                </button>
              </div>

              <!-- Cards Container (Scrollable & Drop Zone) -->
              <div
                class="cards-drop-zone p-2.5 flex-1 overflow-y-auto space-y-2.5 min-h-[480px]"
                data-drop-zone-status="${col.id}"
              >
                ${
                  colTasks.length === 0
                    ? `
                  <div class="py-12 text-center text-flow-text-muted text-xs border border-dashed border-flow-border/50 rounded-lg p-4 pointer-events-none">
                    No tasks in ${col.label}
                  </div>
                `
                    : colTasks.map((t) => renderKanbanCard(t)).join('')
                }
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    </div>
  `;

  // Bind project filter change
  const projectFilterSelect = container.querySelector('#kanban-filter-project');
  projectFilterSelect?.addEventListener('change', () => {
    selectedProjectFilter = projectFilterSelect.value;
    renderKanbanView(container);
  });

  // Bind new task buttons
  container.querySelector('#kanban-btn-new-task')?.addEventListener('click', () => {
    taskModal.openCreate({
      projectId: selectedProjectFilter !== 'all' ? selectedProjectFilter : null,
    });
  });

  container.querySelectorAll('[data-add-to-column]').forEach((btn) => {
    btn.addEventListener('click', () => {
      taskModal.openCreate({
        status: btn.dataset.addToColumn,
        projectId: selectedProjectFilter !== 'all' ? selectedProjectFilter : null,
      });
    });
  });

  // Bind Card Click to Edit
  container.querySelectorAll('.task-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      // Ignore if clicking the accessible movement button or drag handle
      if (e.target.closest('button') || e.target.closest('select')) return;
      const taskId = card.dataset.taskId;
      taskModal.openEdit(taskId);
    });
  });

  // Bind Accessible Status Select on each Card
  container.querySelectorAll('.task-card select[data-card-status-select]').forEach((select) => {
    select.addEventListener('change', (e) => {
      e.stopPropagation();
      const taskId = select.dataset.cardStatusSelect;
      const newStatus = select.value;
      state.moveTask(taskId, newStatus);
      toast.info(`Task moved to ${TASK_STATUS_LABELS[newStatus]}`);
    });
  });

  // Initialize HTML5 Drag & Drop on the rendered elements
  initKanbanDragAndDrop(container);
}

function renderKanbanCard(task) {
  const project = state.getProject(task.projectId);
  const isDone = task.status === TASK_STATUSES.DONE;

  return `
    <div
      class="task-card group relative p-3.5 rounded-lg bg-flow-surface-elevated border border-flow-border hover:border-flow-border/80 shadow-subtle cursor-grab active:cursor-grabbing transition-all"
      draggable="true"
      data-task-id="${task.id}"
      data-task-status="${task.status}"
    >
      <!-- Card Top: Project tag and Accessible movement control -->
      <div class="flex items-center justify-between gap-2 mb-2">
        ${
          project
            ? `
          <div class="flex items-center gap-1.5 text-[11px] text-flow-text-secondary truncate min-w-0">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${project.color || '#8AB4F8'};"></span>
            <span class="truncate font-medium">${escapeHtml(project.name)}</span>
          </div>
        `
            : '<span class="text-[11px] text-flow-text-muted">No project</span>'
        }

        <!-- Accessible Quick-Move dropdown for keyboard / mobile accessibility -->
        <div class="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <select
            data-card-status-select="${task.id}"
            class="bg-flow-surface-primary border border-flow-border text-[10px] text-flow-text-muted hover:text-flow-text-primary rounded px-1.5 py-0.5 focus:outline-hidden"
            title="Move task to another column"
          >
            <option value="" disabled selected>Move to...</option>
            <option value="${TASK_STATUSES.TODO}">${TASK_STATUS_LABELS[TASK_STATUSES.TODO]}</option>
            <option value="${TASK_STATUSES.IN_PROGRESS}">${TASK_STATUS_LABELS[TASK_STATUSES.IN_PROGRESS]}</option>
            <option value="${TASK_STATUSES.IN_REVIEW}">${TASK_STATUS_LABELS[TASK_STATUSES.IN_REVIEW]}</option>
            <option value="${TASK_STATUSES.DONE}">${TASK_STATUS_LABELS[TASK_STATUSES.DONE]}</option>
          </select>
        </div>
      </div>

      <!-- Card Title -->
      <h4 class="text-xs font-medium ${isDone ? 'line-through text-flow-text-muted' : 'text-flow-text-primary'} leading-snug mb-2.5">
        ${escapeHtml(task.title)}
      </h4>

      <!-- Tags (if any) -->
      ${
        task.tags && task.tags.length > 0
          ? `
        <div class="flex flex-wrap gap-1 mb-2.5">
          ${task.tags
            .slice(0, 3)
            .map(
              (tag) => `
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-flow-surface-hover text-flow-text-muted font-mono">
              #${escapeHtml(tag)}
            </span>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      <!-- Card Bottom Metadata: Due Date & Priority -->
      <div class="flex items-center justify-between pt-2 border-t border-flow-border/40 text-[11px]">
        <div class="flex items-center gap-1">
          ${getDueDateDisplay(task.dueDate, isDone)}
        </div>
        ${getPriorityBadge(task.priority)}
      </div>
    </div>
  `;
}

function initKanbanDragAndDrop(container) {
  const cards = container.querySelectorAll('.task-card');
  const dropZones = container.querySelectorAll('.cards-drop-zone');
  const columns = container.querySelectorAll('.kanban-column');

  // Drag Start / End for Cards
  cards.forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      draggedTaskId = card.dataset.taskId;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedTaskId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedTaskId = null;
      currentDropTargetTaskId = null;
      columns.forEach((col) => col.classList.remove('drag-over'));
      document.querySelectorAll('.drop-indicator').forEach((el) => el.remove());
    });

    // Drag over card to determine target insertion
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = card.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      // Show indicator
      document.querySelectorAll('.drop-indicator').forEach((el) => el.remove());
      const indicator = document.createElement('div');
      indicator.className = 'drop-indicator';

      if (e.clientY < midY) {
        card.parentNode.insertBefore(indicator, card);
        currentDropTargetTaskId = card.dataset.taskId;
      } else {
        card.parentNode.insertBefore(indicator, card.nextSibling);
        currentDropTargetTaskId = card.nextElementSibling?.dataset?.taskId || null;
      }
    });
  });

  // Drop Zones (Columns)
  dropZones.forEach((zone) => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const col = zone.closest('.kanban-column');
      if (col) col.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      if (!zone.contains(e.relatedTarget)) {
        const col = zone.closest('.kanban-column');
        if (col) col.classList.remove('drag-over');
      }
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const col = zone.closest('.kanban-column');
      if (col) col.classList.remove('drag-over');
      document.querySelectorAll('.drop-indicator').forEach((el) => el.remove());

      const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
      const targetStatus = zone.dataset.dropZoneStatus;

      if (!taskId || !targetStatus) return;

      const task = state.getTask(taskId);
      if (!task) return;

      const prevStatus = task.status;

      // Perform genuine state mutation
      state.moveTask(taskId, targetStatus, currentDropTargetTaskId);

      if (prevStatus !== targetStatus) {
        toast.success(`Task moved to ${TASK_STATUS_LABELS[targetStatus]}`);
      }

      draggedTaskId = null;
      currentDropTargetTaskId = null;
    });
  });
}
