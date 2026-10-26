/**
 * FLOW - Calendar Task View (Month Grid + Day Agenda)
 */

import { state } from '../state.js';
import { taskModal } from '../components/taskModal.js';
import {
  escapeHtml,
  getPriorityBadge,
  getStatusBadge,
  formatDateString,
  formatShortDate,
} from '../utils.js';

let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth(); // 0-indexed
let selectedDateStr = new Date().toISOString().split('T')[0];

export function renderCalendarView(container) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthName = monthNames[currentCalMonth];

  // Group tasks by dueDate
  const tasksByDate = {};
  state.tasks.forEach((t) => {
    if (t.dueDate) {
      if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
      tasksByDate[t.dueDate].push(t);
    }
  });

  const selectedDateTasks = tasksByDate[selectedDateStr] || [];

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-flow-border/60 pb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-flow-text-primary">Calendar</h1>
          <p class="text-sm text-flow-text-secondary mt-1">Schedule deliverables, track milestones, and view deadlines on a monthly timeline.</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Month Navigation -->
          <div class="flex items-center p-0.5 rounded-lg bg-flow-surface-elevated border border-flow-border">
            <button
              id="cal-btn-prev"
              class="p-1.5 rounded-md text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover transition-colors"
              title="Previous Month"
            >
              <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>
            <button
              id="cal-btn-today"
              class="px-2.5 py-1 text-xs font-medium text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover rounded-md transition-colors"
            >
              Today
            </button>
            <button
              id="cal-btn-next"
              class="p-1.5 rounded-md text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover transition-colors"
              title="Next Month"
            >
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>

          <span class="text-sm font-semibold text-flow-text-primary min-w-[130px] text-center font-mono">
            ${currentMonthName} ${currentCalYear}
          </span>

          <button id="cal-btn-new-task" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>New Task</span>
          </button>
        </div>
      </div>

      <!-- Calendar Main Layout (Month Grid + Day Agenda Panel) -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <!-- Month Grid (3 cols) -->
        <div class="lg:col-span-3 rounded-xl border border-flow-border bg-flow-surface-primary overflow-hidden">
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 border-b border-flow-border bg-flow-surface-elevated text-center text-xs font-semibold text-flow-text-muted py-2.5">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span class="text-flow-text-muted/70">Sat</span>
            <span class="text-flow-text-muted/70">Sun</span>
          </div>

          <!-- Calendar Days Grid -->
          <div class="grid grid-cols-7 divide-x divide-y divide-flow-border/50">
            ${renderMonthDays(currentCalYear, currentCalMonth, tasksByDate, selectedDateStr)}
          </div>
        </div>

        <!-- Agenda Panel (1 col) -->
        <div class="p-5 rounded-xl border border-flow-border bg-flow-surface-primary flex flex-col min-h-[420px]">
          <div class="flex items-center justify-between pb-3 border-b border-flow-border">
            <div>
              <span class="text-[11px] font-semibold text-flow-text-muted uppercase tracking-wider block">Agenda</span>
              <h3 class="text-sm font-semibold text-flow-text-primary mt-0.5">
                ${formatDateString(selectedDateStr)}
              </h3>
            </div>
            <button
              id="cal-btn-add-for-date"
              class="p-1.5 text-xs text-flow-accent hover:bg-flow-surface-elevated rounded-lg transition-colors border border-flow-border"
              title="Add task for this date"
            >
              <i data-lucide="plus" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Agenda Tasks List -->
          <div class="flex-1 overflow-y-auto py-3 space-y-2.5">
            ${renderAgendaTasks(selectedDateTasks)}
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Month Navigation
  container.querySelector('#cal-btn-prev')?.addEventListener('click', () => {
    currentCalMonth--;
    if (currentCalMonth < 0) {
      currentCalMonth = 11;
      currentCalYear--;
    }
    renderCalendarView(container);
  });

  container.querySelector('#cal-btn-next')?.addEventListener('click', () => {
    currentCalMonth++;
    if (currentCalMonth > 11) {
      currentCalMonth = 0;
      currentCalYear++;
    }
    renderCalendarView(container);
  });

  container.querySelector('#cal-btn-today')?.addEventListener('click', () => {
    const today = new Date();
    currentCalYear = today.getFullYear();
    currentCalMonth = today.getMonth();
    selectedDateStr = today.toISOString().split('T')[0];
    renderCalendarView(container);
  });

  // Bind New Task
  container.querySelector('#cal-btn-new-task')?.addEventListener('click', () => {
    taskModal.openCreate({ dueDate: selectedDateStr });
  });

  container.querySelector('#cal-btn-add-for-date')?.addEventListener('click', () => {
    taskModal.openCreate({ dueDate: selectedDateStr });
  });

  // Bind Day Cell Clicks
  container.querySelectorAll('[data-cal-date]').forEach((cell) => {
    cell.addEventListener('click', () => {
      selectedDateStr = cell.dataset.calDate;
      renderCalendarView(container);
    });
  });

  // Bind Task Chips inside Calendar
  container.querySelectorAll('[data-cal-task-id]').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      taskModal.openEdit(chip.dataset.calTaskId);
    });
  });

  // Bind Agenda Task Click
  container.querySelectorAll('[data-agenda-task-id]').forEach((row) => {
    row.addEventListener('click', () => {
      taskModal.openEdit(row.dataset.agendaTaskId);
    });
  });
}

function renderMonthDays(year, month, tasksByDate, selectedDate) {
  const todayStr = new Date().toISOString().split('T')[0];

  // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDay = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = (firstDay + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  let cells = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    cells.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ dayNum: day, dateStr, isCurrentMonth: true });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ dayNum: day, dateStr, isCurrentMonth: false });
  }

  return cells
    .map((cell) => {
      const isToday = cell.dateStr === todayStr;
      const isSelected = cell.dateStr === selectedDate;
      const dayTasks = tasksByDate[cell.dateStr] || [];

      return `
      <div
        data-cal-date="${cell.dateStr}"
        class="min-h-[95px] p-2 flex flex-col justify-between cursor-pointer transition-colors relative ${
          !cell.isCurrentMonth
            ? 'opacity-35 bg-flow-surface-elevated/20'
            : isSelected
            ? 'bg-flow-accent-subtle/30 ring-1 ring-inset ring-flow-accent/60'
            : 'hover:bg-flow-surface-hover/40 bg-flow-surface-primary'
        }"
      >
        <!-- Cell Top: Date Number -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium rounded-full w-6 h-6 flex items-center justify-center ${
            isToday
              ? 'bg-flow-accent text-black font-bold'
              : isSelected
              ? 'bg-flow-surface-hover text-flow-accent font-semibold'
              : 'text-flow-text-secondary'
          }">
            ${cell.dayNum}
          </span>

          ${
            dayTasks.length > 0
              ? `
            <span class="text-[10px] font-mono text-flow-text-muted">
              ${dayTasks.length} ${dayTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          `
              : ''
          }
        </div>

        <!-- Task Chips inside cell (max 2) -->
        <div class="space-y-1 mt-1 flex-1 overflow-hidden">
          ${dayTasks
            .slice(0, 2)
            .map((t) => {
              const isDone = t.status === 'done';
              let dotColor = '#9CA3AF';
              if (t.priority === 'high') dotColor = '#F87171';
              if (t.priority === 'medium') dotColor = '#FBBF24';

              return `
              <div
                data-cal-task-id="${t.id}"
                class="group/chip text-[11px] px-1.5 py-0.5 rounded truncate flex items-center gap-1.5 transition-colors ${
                  isDone
                    ? 'bg-flow-surface-elevated text-flow-text-muted line-through'
                    : 'bg-flow-surface-elevated hover:bg-flow-surface-hover text-flow-text-primary border border-flow-border/50'
                }"
                title="${escapeHtml(t.title)}"
              >
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background-color: ${dotColor};"></span>
                <span class="truncate">${escapeHtml(t.title)}</span>
              </div>
            `;
            })
            .join('')}

          ${
            dayTasks.length > 2
              ? `<div class="text-[10px] text-flow-text-muted font-medium pl-1">+${dayTasks.length - 2} more</div>`
              : ''
          }
        </div>
      </div>
    `;
    })
    .join('');
}

function renderAgendaTasks(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="py-12 text-center text-flow-text-muted text-xs">
        <i data-lucide="calendar" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
        No tasks scheduled for this day.
      </div>
    `;
  }

  return tasks
    .map((t) => {
      const project = state.getProject(t.projectId);
      const isDone = t.status === 'done';

      return `
      <div
        data-agenda-task-id="${t.id}"
        class="group p-3 rounded-lg bg-flow-surface-elevated border border-flow-border hover:border-flow-accent/40 cursor-pointer transition-all"
      >
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-xs font-medium text-flow-text-primary group-hover:text-flow-accent transition-colors ${
            isDone ? 'line-through text-flow-text-muted' : ''
          }">
            ${escapeHtml(t.title)}
          </h4>
          ${getPriorityBadge(t.priority)}
        </div>

        <div class="flex items-center justify-between text-[11px] text-flow-text-muted mt-2">
          ${
            project
              ? `
            <span class="flex items-center gap-1 truncate max-w-[140px]">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${project.color || '#8AB4F8'};"></span>
              <span class="truncate">${escapeHtml(project.name)}</span>
            </span>
          `
              : '<span>No project</span>'
          }
          ${getStatusBadge(t.status)}
        </div>
      </div>
    `;
    })
    .join('');
}
