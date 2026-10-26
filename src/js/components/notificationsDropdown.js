/**
 * FLOW - Notifications Dropdown Component
 */

import { state } from '../state.js';
import { taskModal } from './taskModal.js';
import { isOverdue, isDueToday, escapeHtml, timeAgo } from '../utils.js';

class NotificationsDropdown {
  constructor() {
    this.container = null;
    this.isOpen = false;
    this.dismissedIds = new Set();
  }

  init() {
    this.container = document.getElementById('dropdown-notifications');
    const bellBtn = document.getElementById('btn-notifications');

    if (!bellBtn || !this.container) return;

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target) && !bellBtn.contains(e.target)) {
        this.close();
      }
    });

    this.updateBadge();
  }

  getNotifications() {
    const alerts = [];

    // Overdue tasks
    state.tasks.forEach((t) => {
      if (t.status !== 'done' && isOverdue(t.dueDate, false)) {
        alerts.push({
          id: `overdue-${t.id}`,
          taskId: t.id,
          type: 'overdue',
          title: `Task Overdue: ${t.title}`,
          subtitle: `Was due on ${t.dueDate}`,
          severity: 'error',
          timestamp: t.dueDate,
        });
      } else if (t.status !== 'done' && isDueToday(t.dueDate)) {
        alerts.push({
          id: `today-${t.id}`,
          taskId: t.id,
          type: 'today',
          title: `Due Today: ${t.title}`,
          subtitle: `Target completion today`,
          severity: 'warning',
          timestamp: t.dueDate,
        });
      }
    });

    // Recent activity alerts (last 3)
    state.activities.slice(0, 3).forEach((act) => {
      alerts.push({
        id: act.id,
        taskId: null,
        type: 'activity',
        title: act.title,
        subtitle: timeAgo(act.timestamp),
        severity: 'info',
        timestamp: act.timestamp,
      });
    });

    return alerts.filter((a) => !this.dismissedIds.has(a.id));
  }

  updateBadge() {
    const badge = document.getElementById('notifications-badge');
    if (!badge) return;

    const unreadCount = this.getNotifications().filter(
      (a) => a.severity === 'error' || a.severity === 'warning'
    ).length;

    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.render();
    this.container.classList.remove('hidden');
  }

  close() {
    this.isOpen = false;
    this.container.classList.add('hidden');
  }

  render() {
    const notifications = this.getNotifications();

    let contentHtml = '';
    if (notifications.length === 0) {
      contentHtml = `
        <div class="py-8 text-center text-flow-text-muted text-xs">
          <svg class="w-8 h-8 mx-auto mb-2 opacity-40 text-flow-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          No pending notifications. All caught up!
        </div>
      `;
    } else {
      contentHtml = notifications
        .map((item) => {
          let dotColor = 'bg-flow-accent';
          if (item.severity === 'error') dotColor = 'bg-[#F87171]';
          if (item.severity === 'warning') dotColor = 'bg-[#FBBF24]';

          return `
          <div
            data-notification-task="${item.taskId || ''}"
            class="group flex items-start gap-3 p-3 rounded-lg hover:bg-flow-surface-hover/80 cursor-pointer transition-colors border border-transparent hover:border-flow-border/40"
          >
            <span class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}"></span>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-medium text-flow-text-primary leading-tight">${escapeHtml(item.title)}</div>
              <div class="text-[11px] text-flow-text-muted mt-0.5">${escapeHtml(item.subtitle)}</div>
            </div>
          </div>
        `;
        })
        .join('');
    }

    this.container.innerHTML = `
      <div class="p-3 border-b border-flow-border flex items-center justify-between">
        <span class="text-xs font-semibold text-flow-text-primary uppercase tracking-wider">Notifications & Alerts</span>
        <button id="btn-clear-notifications" class="text-[11px] text-flow-accent hover:text-flow-accent-hover font-medium">Clear All</button>
      </div>
      <div class="max-h-80 overflow-y-auto p-2 divide-y divide-flow-border/30">
        ${contentHtml}
      </div>
    `;

    // Bind item click
    this.container.querySelectorAll('[data-notification-task]').forEach((el) => {
      const taskId = el.dataset.notificationTask;
      if (taskId) {
        el.addEventListener('click', () => {
          this.close();
          taskModal.openEdit(taskId);
        });
      }
    });

    // Clear all
    const clearBtn = this.container.querySelector('#btn-clear-notifications');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        notifications.forEach((n) => this.dismissedIds.add(n.id));
        this.render();
        this.updateBadge();
      });
    }
  }
}

export const notificationsDropdown = new NotificationsDropdown();
