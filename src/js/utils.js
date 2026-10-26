/**
 * FLOW - Utility Functions
 */

import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
} from './models.js';

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatDateString(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dateStr, isCompleted = false) {
  if (!dateStr || isCompleted) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = dateStr.split('-');
  const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return due < today;
}

export function isDueToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return dateStr === todayStr;
}

export function isDueThisWeek(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const parts = dateStr.split('-');
  const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return due >= today && due <= endOfWeek;
}

export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const past = new Date(timestamp);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getPriorityBadge(priority) {
  switch (priority) {
    case TASK_PRIORITIES.HIGH:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#450A0A] text-[#F87171] border border-[#7F1D1D]/40">
        <span class="w-1.5 h-1.5 rounded-full bg-[#F87171]"></span> High
      </span>`;
    case TASK_PRIORITIES.MEDIUM:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#451A03] text-[#FBBF24] border border-[#78350F]/40">
        <span class="w-1.5 h-1.5 rounded-full bg-[#FBBF24]"></span> Medium
      </span>`;
    case TASK_PRIORITIES.LOW:
    default:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#1F2937] text-[#9CA3AF] border border-[#374151]/40">
        <span class="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span> Low
      </span>`;
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case TASK_STATUSES.DONE:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#064E3B] text-[#34D399] border border-[#059669]/40">
        <i data-lucide="check" class="w-3 h-3"></i> Done
      </span>`;
    case TASK_STATUSES.IN_REVIEW:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#1E1B4B] text-[#A78BFA] border border-[#4338CA]/40">
        <i data-lucide="eye" class="w-3 h-3"></i> In Review
      </span>`;
    case TASK_STATUSES.IN_PROGRESS:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#172337] text-[#8AB4F8] border border-[#8AB4F8]/30">
        <i data-lucide="clock" class="w-3 h-3"></i> In Progress
      </span>`;
    case TASK_STATUSES.TODO:
    default:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#1F2937] text-[#9CA3AF] border border-[#374151]/40">
        <i data-lucide="circle" class="w-3 h-3"></i> To Do
      </span>`;
  }
}

export function getProjectStatusBadge(status) {
  switch (status) {
    case PROJECT_STATUSES.ACTIVE:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/30">
        <span class="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span> Active
      </span>`;
    case PROJECT_STATUSES.ON_HOLD:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#451A03]/80 text-[#FBBF24] border border-[#78350F]/30">
        <span class="w-1.5 h-1.5 rounded-full bg-[#FBBF24]"></span> On Hold
      </span>`;
    case PROJECT_STATUSES.COMPLETED:
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1F2937] text-[#9CA3AF] border border-[#374151]/40">
        <span class="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span> Completed
      </span>`;
    default:
      return '';
  }
}

export function getDueDateDisplay(dateStr, isCompleted = false) {
  if (!dateStr) return '<span class="text-flow-text-muted text-xs">No deadline</span>';

  const overdue = isOverdue(dateStr, isCompleted);
  const dueToday = isDueToday(dateStr);
  const formatted = formatShortDate(dateStr);

  if (overdue) {
    return `<span class="inline-flex items-center gap-1 text-xs text-[#F87171] font-medium" title="Overdue: ${dateStr}">
      <i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> ${formatted} (Overdue)
    </span>`;
  }

  if (dueToday) {
    return `<span class="inline-flex items-center gap-1 text-xs text-[#FBBF24] font-medium" title="Due today">
      <i data-lucide="clock" class="w-3.5 h-3.5"></i> Today
    </span>`;
  }

  return `<span class="inline-flex items-center gap-1 text-xs text-flow-text-secondary" title="${dateStr}">
    <i data-lucide="calendar" class="w-3.5 h-3.5 text-flow-text-muted"></i> ${formatted}
  </span>`;
}
