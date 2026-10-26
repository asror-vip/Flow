/**
 * FLOW - Main Application Entrypoint & Router
 */

import { renderIcons } from './js/icons.js';
import { state } from './js/state.js';
import { taskModal } from './js/components/taskModal.js';
import { projectModal } from './js/components/projectModal.js';
import { searchModal } from './js/components/searchModal.js';
import { notificationsDropdown } from './js/components/notificationsDropdown.js';
import { renderOverviewView } from './js/views/overviewView.js';
import { renderProjectsView } from './js/views/projectsView.js';
import { renderProjectDetailView } from './js/views/projectDetailView.js';
import { renderKanbanView } from './js/views/kanbanView.js';
import { renderTasksView } from './js/views/tasksView.js';
import { renderCalendarView } from './js/views/calendarView.js';
import { renderSettingsView } from './js/views/settingsView.js';
import { escapeHtml } from './js/utils.js';

class FlowApplication {
  constructor() {
    this.viewContainer = document.getElementById('view-container');
    this.topbarTitle = document.getElementById('topbar-page-title');
    this.sidebarEl = document.getElementById('app-sidebar');
    this.mobileBackdrop = document.getElementById('mobile-sidebar-backdrop');
    this.currentRoute = '';
  }

  init() {
    state.applySettingsToDOM();
    this.initNavigation();
    this.initMobileDrawer();
    this.initTopBarActions();
    notificationsDropdown.init();
    this.renderSidebarProjects();
    this.renderSidebarProfile();

    // Listen to state changes to refresh UI
    state.subscribe((store, eventType) => {
      this.renderSidebarProjects();
      this.renderSidebarProfile();
      notificationsDropdown.updateBadge();
      this.handleRoute();
    });

    // Handle Hash Router
    window.addEventListener('hashchange', () => this.handleRoute());

    // Initial Route
    if (!window.location.hash) {
      window.location.hash = `#${state.settings.defaultView || 'overview'}`;
    } else {
      this.handleRoute();
    }

    // Global keyboard shortcuts
    this.initKeyboardShortcuts();
  }

  refreshIcons() {
    requestAnimationFrame(() => {
      renderIcons();
    });
  }

  handleRoute() {
    const hash = window.location.hash || '#overview';
    this.currentRoute = hash;

    // Close mobile drawer on route transition
    this.closeMobileDrawer();

    // Route matching
    if (hash === '#overview') {
      state.currentView = 'overview';
      this.setActiveNav('overview');
      this.setPageTitle('Overview');
      renderOverviewView(this.viewContainer);
    } else if (hash === '#projects') {
      state.currentView = 'projects';
      this.setActiveNav('projects');
      this.setPageTitle('Projects');
      renderProjectsView(this.viewContainer);
    } else if (hash.startsWith('#project/')) {
      const projectId = hash.replace('#project/', '');
      state.currentView = 'project_detail';
      state.selectedProjectId = projectId;
      const proj = state.getProject(projectId);
      this.setActiveNav('projects');
      this.setPageTitle(proj ? proj.name : 'Project Details');
      renderProjectDetailView(this.viewContainer, projectId);
    } else if (hash === '#kanban') {
      state.currentView = 'kanban';
      this.setActiveNav('kanban');
      this.setPageTitle('Kanban Board');
      renderKanbanView(this.viewContainer);
    } else if (hash === '#tasks') {
      state.currentView = 'tasks';
      this.setActiveNav('tasks');
      this.setPageTitle('My Tasks');
      renderTasksView(this.viewContainer);
    } else if (hash === '#calendar') {
      state.currentView = 'calendar';
      this.setActiveNav('calendar');
      this.setPageTitle('Calendar');
      renderCalendarView(this.viewContainer);
    } else if (hash === '#settings') {
      state.currentView = 'settings';
      this.setActiveNav('settings');
      this.setPageTitle('Settings');
      renderSettingsView(this.viewContainer);
    } else {
      window.location.hash = '#overview';
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.refreshIcons();
  }

  setActiveNav(navName) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      const match = link.dataset.nav === navName;
      if (match) {
        link.className =
          'nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-flow-accent bg-flow-accent-subtle/40 border border-flow-accent/30 transition-colors';
      } else {
        link.className =
          'nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover/70 transition-colors';
      }
    });
  }

  setPageTitle(title) {
    if (this.topbarTitle) {
      this.topbarTitle.textContent = title;
    }
    document.title = `${title} — FLOW`;
  }

  renderSidebarProjects() {
    const listEl = document.getElementById('sidebar-projects-list');
    if (!listEl) return;

    if (state.projects.length === 0) {
      listEl.innerHTML = `<div class="px-3 py-2 text-[11px] text-flow-text-muted">No projects yet</div>`;
      return;
    }

    listEl.innerHTML = state.projects
      .slice(0, 6)
      .map((p) => {
        const isSelected = window.location.hash === `#project/${p.id}`;
        const progress = state.getProjectProgress(p.id);

        return `
        <a
          href="#project/${p.id}"
          class="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors group ${
            isSelected
              ? 'bg-flow-surface-hover text-flow-text-primary font-semibold border border-flow-border'
              : 'text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover/40'
          }"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${p.color || '#8AB4F8'};"></span>
            <span class="truncate">${escapeHtml(p.name)}</span>
          </div>
          <span class="text-[10px] text-flow-text-muted font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            ${progress.percentage}%
          </span>
        </a>
      `;
      })
      .join('');
  }

  renderSidebarProfile() {
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');

    const name = state.settings.displayName || 'Alex Vance';
    const role = state.settings.role || 'Product Designer & Developer';

    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = role;

    if (avatarEl) {
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      avatarEl.textContent = initials || 'AV';
    }
  }

  initNavigation() {
    const addProjBtn = document.getElementById('sidebar-btn-add-project');
    addProjBtn?.addEventListener('click', () => {
      projectModal.openCreate();
    });
  }

  initTopBarActions() {
    const searchBtn = document.getElementById('topbar-btn-search');
    searchBtn?.addEventListener('click', () => {
      searchModal.open();
    });

    const newTaskBtn = document.getElementById('topbar-btn-new-task');
    newTaskBtn?.addEventListener('click', () => {
      taskModal.openCreate();
    });
  }

  initMobileDrawer() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');

    toggleBtn?.addEventListener('click', () => this.openMobileDrawer());
    closeBtn?.addEventListener('click', () => this.closeMobileDrawer());
    this.mobileBackdrop?.addEventListener('click', () => this.closeMobileDrawer());
  }

  openMobileDrawer() {
    if (this.sidebarEl) {
      this.sidebarEl.classList.remove('-translate-x-full');
      this.sidebarEl.classList.add('translate-x-0');
    }
    if (this.mobileBackdrop) {
      this.mobileBackdrop.classList.remove('hidden');
    }
    document.body.classList.add('overflow-hidden');
  }

  closeMobileDrawer() {
    if (this.sidebarEl) {
      this.sidebarEl.classList.remove('translate-x-0');
      this.sidebarEl.classList.add('-translate-x-full');
    }
    if (this.mobileBackdrop) {
      this.mobileBackdrop.classList.add('hidden');
    }
    document.body.classList.remove('overflow-hidden');
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input, textarea, or select
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // 'N' for New Task
      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          taskModal.openCreate();
        }
      }
    });
  }
}

// Global instance exposed on window for inline handlers
const app = new FlowApplication();
window.flowApp = {
  openNewProject: () => projectModal.openCreate(),
  openNewTask: () => taskModal.openCreate(),
};

// Start application
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
