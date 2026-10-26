/**
 * FLOW - Overview Dashboard View
 */

import { state } from '../state.js';
import { taskModal } from '../components/taskModal.js';
import { projectModal } from '../components/projectModal.js';
import {
  escapeHtml,
  getPriorityBadge,
  getStatusBadge,
  getDueDateDisplay,
  timeAgo,
} from '../utils.js';

export function renderOverviewView(container) {
  const metrics = state.getSummaryMetrics();
  const activeProjects = state.projects.filter((p) => p.status === 'active');
  const urgentTasks = state.tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      // Sort: high priority first, then closer due dates
      const pMap = { high: 0, medium: 1, low: 2 };
      if (pMap[a.priority] !== pMap[b.priority]) return pMap[a.priority] - pMap[b.priority];
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      return 1;
    })
    .slice(0, 5);

  const weeklyData = state.getWeeklyActivityData();

  // Dynamic greeting
  const hour = new Date().getHours();
  let greetingTime = 'Good morning';
  if (hour >= 12 && hour < 18) greetingTime = 'Good afternoon';
  else if (hour >= 18 || hour < 5) greetingTime = 'Good evening';

  const userGreeting = `${greetingTime}, ${escapeHtml(state.settings.displayName || 'Alex')}`;

  // Generate SVG Chart for Weekly Activity
  const chartSvg = generateWeeklyActivityChart(weeklyData);

  container.innerHTML = `
    <div class="space-y-8 animate-fadeIn">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-flow-border/60 pb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-flow-text-primary">${userGreeting}</h1>
          <p class="text-sm text-flow-text-secondary mt-1">Here’s what’s happening across your workspace today.</p>
        </div>
        <div class="flex items-center gap-3">
          <button id="overview-btn-new-project" class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-flow-text-secondary hover:text-flow-text-primary bg-flow-surface-elevated hover:bg-flow-surface-hover rounded-lg border border-flow-border transition-colors">
            <i data-lucide="folder-plus" class="w-4 h-4 text-flow-accent"></i>
            <span>New Project</span>
          </button>
          <button id="overview-btn-new-task" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>New Task</span>
          </button>
        </div>
      </div>

      <!-- 4 Summary KPI Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Active Projects -->
        <div class="p-5 rounded-xl bg-flow-surface-primary border border-flow-border hover:border-flow-border/80 transition-colors">
          <div class="flex items-center justify-between text-flow-text-muted mb-3">
            <span class="text-xs font-medium tracking-wide uppercase">Active Projects</span>
            <div class="w-7 h-7 rounded-lg bg-flow-surface-elevated flex items-center justify-center text-flow-accent border border-flow-border">
              <i data-lucide="folder" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-2xl font-bold text-flow-text-primary tracking-tight">${metrics.activeProjects}</div>
          <div class="text-xs text-flow-text-secondary mt-1 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
            <span>${state.projects.length} total registered</span>
          </div>
        </div>

        <!-- In Progress Tasks -->
        <div class="p-5 rounded-xl bg-flow-surface-primary border border-flow-border hover:border-flow-border/80 transition-colors">
          <div class="flex items-center justify-between text-flow-text-muted mb-3">
            <span class="text-xs font-medium tracking-wide uppercase">In Progress</span>
            <div class="w-7 h-7 rounded-lg bg-flow-surface-elevated flex items-center justify-center text-[#8AB4F8] border border-flow-border">
              <i data-lucide="clock" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-2xl font-bold text-flow-text-primary tracking-tight">${metrics.inProgressTasks}</div>
          <div class="text-xs text-flow-text-secondary mt-1">
            <span>Tasks currently underway</span>
          </div>
        </div>

        <!-- Completed This Week -->
        <div class="p-5 rounded-xl bg-flow-surface-primary border border-flow-border hover:border-flow-border/80 transition-colors">
          <div class="flex items-center justify-between text-flow-text-muted mb-3">
            <span class="text-xs font-medium tracking-wide uppercase">Completed This Week</span>
            <div class="w-7 h-7 rounded-lg bg-flow-surface-elevated flex items-center justify-center text-[#34D399] border border-flow-border">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-2xl font-bold text-flow-text-primary tracking-tight">${metrics.completedThisWeek}</div>
          <div class="text-xs text-flow-text-secondary mt-1">
            <span>Finished in last 7 days</span>
          </div>
        </div>

        <!-- Approaching Deadlines -->
        <div class="p-5 rounded-xl bg-flow-surface-primary border border-flow-border hover:border-flow-border/80 transition-colors">
          <div class="flex items-center justify-between text-flow-text-muted mb-3">
            <span class="text-xs font-medium tracking-wide uppercase">Due Soon</span>
            <div class="w-7 h-7 rounded-lg bg-flow-surface-elevated flex items-center justify-center text-[#FBBF24] border border-flow-border">
              <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
            </div>
          </div>
          <div class="text-2xl font-bold ${metrics.approachingDeadlines > 0 ? 'text-[#FBBF24]' : 'text-flow-text-primary'} tracking-tight">${metrics.approachingDeadlines}</div>
          <div class="text-xs text-flow-text-secondary mt-1">
            <span>Due within next 3 days</span>
          </div>
        </div>
      </div>

      <!-- Main Overview Grid: Chart & Active Projects -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Weekly Task Activity Chart (2 cols) -->
        <div class="lg:col-span-2 p-6 rounded-xl bg-flow-surface-primary border border-flow-border flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-semibold text-flow-text-primary">Weekly Task Velocity</h2>
              <p class="text-xs text-flow-text-muted mt-0.5">Completed vs newly created tasks over the past 7 days</p>
            </div>
            <div class="flex items-center gap-4 text-xs">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#34D399]"></span>
                <span class="text-flow-text-secondary">Completed</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-flow-accent"></span>
                <span class="text-flow-text-secondary">Created</span>
              </div>
            </div>
          </div>

          <div class="w-full overflow-hidden mt-2">
            ${chartSvg}
          </div>
        </div>

        <!-- Recent Activity Feed (1 col) -->
        <div class="p-6 rounded-xl bg-flow-surface-primary border border-flow-border flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-flow-text-primary">Recent Activity</h2>
            <span class="text-[11px] text-flow-text-muted font-mono">Live Log</span>
          </div>

          <div class="space-y-4 flex-1 overflow-y-auto max-h-72 pr-1">
            ${renderRecentActivity(state.activities.slice(0, 6))}
          </div>
        </div>
      </div>

      <!-- Active Projects Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-semibold text-flow-text-primary">Active Projects</h2>
            <p class="text-xs text-flow-text-secondary mt-0.5">Projects currently in active progression</p>
          </div>
          <a href="#projects" class="text-xs text-flow-accent hover:text-flow-accent-hover font-medium flex items-center gap-1 transition-colors">
            <span>View all projects</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${renderActiveProjects(activeProjects)}
        </div>
      </div>

      <!-- Priority Tasks Section -->
      <div class="p-6 rounded-xl bg-flow-surface-primary border border-flow-border">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-semibold text-flow-text-primary">Priority Attention Required</h2>
            <p class="text-xs text-flow-text-secondary mt-0.5">High priority and upcoming tasks requiring focus</p>
          </div>
          <a href="#tasks" class="text-xs text-flow-accent hover:text-flow-accent-hover font-medium flex items-center gap-1 transition-colors">
            <span>View all tasks</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>

        <div class="divide-y divide-flow-border/40">
          ${renderPriorityTasks(urgentTasks)}
        </div>
      </div>
    </div>
  `;

  // Bind Buttons
  container.querySelector('#overview-btn-new-project')?.addEventListener('click', () => {
    projectModal.openCreate();
  });

  container.querySelector('#overview-btn-new-task')?.addEventListener('click', () => {
    taskModal.openCreate();
  });

  // Bind Task Checkbox & Task Item clicks
  container.querySelectorAll('[data-task-toggle-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.dataset.taskToggleId;
      state.toggleTaskComplete(taskId);
    });
  });

  container.querySelectorAll('[data-task-item-id]').forEach((row) => {
    row.addEventListener('click', () => {
      const taskId = row.dataset.taskItemId;
      taskModal.openEdit(taskId);
    });
  });
}

function renderActiveProjects(projects) {
  if (projects.length === 0) {
    return `
      <div class="col-span-full py-10 text-center rounded-xl border border-dashed border-flow-border bg-flow-surface-elevated/40">
        <i data-lucide="folder" class="w-8 h-8 mx-auto text-flow-text-muted mb-2"></i>
        <p class="text-sm text-flow-text-secondary">No active projects found.</p>
        <button onclick="window.flowApp.openNewProject()" class="mt-3 text-xs text-flow-accent hover:underline font-medium">
          + Create your first project
        </button>
      </div>
    `;
  }

  return projects
    .slice(0, 3)
    .map((p) => {
      const progress = state.getProjectProgress(p.id);
      return `
      <a href="#project/${p.id}" class="group block p-5 rounded-xl bg-flow-surface-primary border border-flow-border hover:border-flow-accent/40 hover:bg-flow-surface-hover/40 transition-all duration-150">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${p.color || '#8AB4F8'};"></span>
            <h3 class="font-semibold text-flow-text-primary text-sm truncate group-hover:text-flow-accent transition-colors">
              ${escapeHtml(p.name)}
            </h3>
          </div>
          <span class="text-xs font-semibold text-flow-text-primary font-mono">${progress.percentage}%</span>
        </div>

        <p class="text-xs text-flow-text-secondary line-clamp-2 mb-4 leading-relaxed h-8">
          ${p.description ? escapeHtml(p.description) : 'No description provided.'}
        </p>

        <!-- Progress Bar -->
        <div class="w-full h-1.5 rounded-full bg-flow-surface-elevated overflow-hidden mb-3">
          <div
            class="h-full rounded-full transition-all duration-300"
            style="width: ${progress.percentage}%; background-color: ${p.color || '#8AB4F8'};"
          ></div>
        </div>

        <div class="flex items-center justify-between text-xs text-flow-text-muted">
          <span>${progress.completed} of ${progress.total} tasks</span>
          ${p.deadline ? `<span>Due ${p.deadline}</span>` : '<span>No deadline</span>'}
        </div>
      </a>
    `;
    })
    .join('');
}

function renderPriorityTasks(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="py-8 text-center text-flow-text-muted text-xs">
        No immediate priority tasks. Everything is on schedule!
      </div>
    `;
  }

  return tasks
    .map((t) => {
      const project = state.getProject(t.projectId);
      return `
      <div
        data-task-item-id="${t.id}"
        class="group flex items-center justify-between py-3.5 px-2 hover:bg-flow-surface-hover/50 rounded-lg cursor-pointer transition-colors"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1 pr-3">
          <button
            type="button"
            data-task-toggle-id="${t.id}"
            class="w-4 h-4 rounded-sm border border-flow-border hover:border-flow-accent flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Mark task done"
          >
            <i data-lucide="check" class="w-3 h-3 text-transparent group-hover:text-flow-text-muted/40"></i>
          </button>
          <div class="min-w-0 flex-1">
            <span class="text-sm font-medium text-flow-text-primary group-hover:text-flow-accent transition-colors truncate block">
              ${escapeHtml(t.title)}
            </span>
            <div class="flex items-center gap-2 text-xs text-flow-text-muted mt-0.5">
              ${project ? `<span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full" style="background-color: ${project.color || '#8AB4F8'};"></span> ${escapeHtml(project.name)}</span>` : ''}
              <span>•</span>
              <span>${getDueDateDisplay(t.dueDate, false)}</span>
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

function renderRecentActivity(activities) {
  if (activities.length === 0) {
    return `<div class="py-8 text-center text-flow-text-muted text-xs">No activity yet.</div>`;
  }

  return activities
    .map((act) => {
      let icon = 'activity';
      let iconClass = 'text-flow-accent';
      if (act.type === 'task_completed') {
        icon = 'check';
        iconClass = 'text-[#34D399]';
      } else if (act.type === 'task_created') {
        icon = 'plus-circle';
        iconClass = 'text-[#8AB4F8]';
      } else if (act.type === 'project_created') {
        icon = 'folder-plus';
        iconClass = 'text-[#A78BFA]';
      }

      return `
      <div class="flex items-start gap-3 text-xs">
        <div class="w-6 h-6 rounded-full bg-flow-surface-elevated flex items-center justify-center flex-shrink-0 border border-flow-border ${iconClass} mt-0.5">
          <i data-lucide="${icon}" class="w-3 h-3"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-flow-text-primary leading-tight font-medium">${escapeHtml(act.title)}</p>
          <span class="text-[11px] text-flow-text-muted mt-0.5 block">${timeAgo(act.timestamp)}</span>
        </div>
      </div>
    `;
    })
    .join('');
}

function generateWeeklyActivityChart(days) {
  // Chart dimensions
  const width = 500;
  const height = 150;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...days.map((d) => Math.max(d.completed, d.active)), 4);
  const stepX = (width - paddingX * 2) / (days.length - 1);

  // Generate path points for completed and active
  const completedPoints = days.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = height - paddingY - (d.completed / maxVal) * (height - paddingY * 2);
    return { x, y, val: d.completed, day: d.dayName, date: d.date };
  });

  const activePoints = days.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = height - paddingY - (d.active / maxVal) * (height - paddingY * 2);
    return { x, y, val: d.active, day: d.dayName, date: d.date };
  });

  const completedPathD = completedPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const activePathD = activePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Gradient area under completed
  const areaD = `${completedPathD} L ${completedPoints[completedPoints.length - 1].x} ${height - paddingY} L ${completedPoints[0].x} ${height - paddingY} Z`;

  return `
    <div class="relative w-full">
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="chartGradientCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#34D399" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#34D399" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Subtle horizontal grid lines -->
        <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" stroke="#282D35" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="${paddingX}" y1="${(height - paddingY + paddingY) / 2}" x2="${width - paddingX}" y2="${(height - paddingY + paddingY) / 2}" stroke="#282D35" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="#282D35" stroke-width="1" />

        <!-- Area under completed line -->
        <path d="${areaD}" fill="url(#chartGradientCompleted)" />

        <!-- Active tasks line (Accent Blue) -->
        <path d="${activePathD}" fill="none" stroke="#8AB4F8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Completed tasks line (Success Emerald) -->
        <path d="${completedPathD}" fill="none" stroke="#34D399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Points and Day Labels -->
        ${days
          .map((d, i) => {
            const cp = completedPoints[i];
            const ap = activePoints[i];
            return `
            <!-- X Axis Label -->
            <text x="${cp.x}" y="${height - 6}" font-size="10" fill="#717987" text-anchor="middle" font-family="Inter, sans-serif">
              ${d.dayName}
            </text>

            <!-- Active point dot -->
            <circle cx="${ap.x}" cy="${ap.y}" r="3" fill="#8AB4F8" stroke="#12151A" stroke-width="1.5">
              <title>${d.dayName}: ${d.active} task(s) created</title>
            </circle>

            <!-- Completed point dot -->
            <circle cx="${cp.x}" cy="${cp.y}" r="3.5" fill="#34D399" stroke="#12151A" stroke-width="1.5">
              <title>${d.dayName}: ${d.completed} task(s) completed</title>
            </circle>
          `;
          })
          .join('')}
      </svg>
    </div>
  `;
}
