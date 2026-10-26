/**
 * FLOW - Global Search Modal (Ctrl+K)
 */

import { state } from '../state.js';
import { modal } from './modal.js';
import { taskModal } from './taskModal.js';
import { escapeHtml, getPriorityBadge, getStatusBadge } from '../utils.js';

class SearchModal {
  constructor() {
    this.modalEl = null;
    this.results = [];
    this.selectedIndex = 0;
  }

  ensureModal() {
    if (!this.modalEl) {
      this.modalEl = document.getElementById('modal-search');
      if (!this.modalEl) {
        this.modalEl = document.createElement('div');
        this.modalEl.id = 'modal-search';
        this.modalEl.className = 'fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 hidden';
        this.modalEl.innerHTML = `
          <div class="modal-backdrop fixed inset-0 bg-black/75 backdrop-blur-xs opacity-0 transition-opacity"></div>
          <div class="modal-content relative w-full max-w-2xl bg-flow-surface-elevated border border-flow-border rounded-xl shadow-modal opacity-0 scale-95 transition-all overflow-hidden flex flex-col max-h-[75vh]">
            <!-- Search Input Header -->
            <div class="flex items-center px-4 py-3.5 border-b border-flow-border gap-3">
              <svg class="w-5 h-5 text-flow-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                id="global-search-input"
                placeholder="Search projects, tasks, tags... (Use ↑↓ arrows, Enter to open)"
                class="flex-1 bg-transparent text-sm text-flow-text-primary placeholder:text-flow-text-muted focus:outline-hidden"
                autocomplete="off"
              />
              <span class="text-[11px] font-mono text-flow-text-muted px-1.5 py-0.5 rounded border border-flow-border bg-flow-surface-primary">ESC</span>
            </div>

            <!-- Search Results Body -->
            <div id="global-search-results" class="overflow-y-auto p-2 divide-y divide-flow-border/40 text-sm flex-1">
              <div class="py-12 text-center text-flow-text-muted text-xs">
                Start typing to search tasks, projects, and tags...
              </div>
            </div>

            <!-- Search Footer -->
            <div class="px-4 py-2.5 bg-flow-surface-primary border-t border-flow-border flex items-center justify-between text-[11px] text-flow-text-muted">
              <div class="flex items-center gap-3">
                <span><kbd class="px-1 py-0.5 rounded bg-flow-surface-elevated border border-flow-border">↑</kbd> <kbd class="px-1 py-0.5 rounded bg-flow-surface-elevated border border-flow-border">↓</kbd> navigate</span>
                <span><kbd class="px-1 py-0.5 rounded bg-flow-surface-elevated border border-flow-border">↵</kbd> select</span>
              </div>
              <span id="search-result-count">0 results</span>
            </div>
          </div>
        `;
        document.body.appendChild(this.modalEl);
        this.bindEvents();
      }
    }
  }

  bindEvents() {
    const input = this.modalEl.querySelector('#global-search-input');

    input.addEventListener('input', () => {
      this.performSearch(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigate(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigate(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.selectCurrent();
      }
    });

    // Global shortcut listener for Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.open();
      }
    });
  }

  open() {
    this.ensureModal();
    const input = this.modalEl.querySelector('#global-search-input');
    input.value = '';
    this.results = [];
    this.selectedIndex = 0;
    this.performSearch('');
    modal.open(this.modalEl);
    setTimeout(() => input.focus(), 50);
  }

  performSearch(query) {
    const q = query.trim().toLowerCase();
    const container = this.modalEl.querySelector('#global-search-results');
    const countEl = this.modalEl.querySelector('#search-result-count');

    if (!q) {
      this.results = [];
      container.innerHTML = `
        <div class="py-12 text-center text-flow-text-muted text-xs">
          Start typing to search tasks, projects, and tags...
        </div>
      `;
      countEl.textContent = '0 results';
      return;
    }

    // Filter projects
    const matchedProjects = state.projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    ).map((p) => ({ type: 'project', item: p }));

    // Filter tasks
    const matchedTasks = state.tasks.filter((t) => {
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description && t.description.toLowerCase().includes(q);
      const matchTags = Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags;
    }).map((t) => ({ type: 'task', item: t }));

    this.results = [...matchedProjects, ...matchedTasks];
    this.selectedIndex = 0;
    countEl.textContent = `${this.results.length} result${this.results.length === 1 ? '' : 's'}`;

    if (this.results.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-flow-text-muted text-xs">
          No matches found for "<span class="text-flow-text-primary font-medium">${escapeHtml(query)}</span>"
        </div>
      `;
      return;
    }

    let html = '';

    if (matchedProjects.length > 0) {
      html += `<div class="px-3 py-1.5 text-[11px] font-semibold text-flow-text-muted uppercase tracking-wider">Projects</div>`;
      matchedProjects.forEach((res, i) => {
        const p = res.item;
        const globalIdx = i;
        html += `
          <div
            data-search-index="${globalIdx}"
            class="search-item group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              this.selectedIndex === globalIdx ? 'bg-flow-surface-hover border border-flow-accent/40' : 'hover:bg-flow-surface-hover/60 border border-transparent'
            }"
          >
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${p.color || '#8AB4F8'};"></span>
              <div>
                <div class="font-medium text-flow-text-primary text-sm">${escapeHtml(p.name)}</div>
                ${p.description ? `<div class="text-xs text-flow-text-muted truncate max-w-md">${escapeHtml(p.description)}</div>` : ''}
              </div>
            </div>
            <span class="text-xs px-2 py-0.5 rounded bg-flow-surface-primary text-flow-text-secondary border border-flow-border">
              Project
            </span>
          </div>
        `;
      });
    }

    if (matchedTasks.length > 0) {
      html += `<div class="px-3 py-1.5 mt-2 text-[11px] font-semibold text-flow-text-muted uppercase tracking-wider">Tasks</div>`;
      matchedTasks.forEach((res, i) => {
        const t = res.item;
        const globalIdx = matchedProjects.length + i;
        const project = state.getProject(t.projectId);
        html += `
          <div
            data-search-index="${globalIdx}"
            class="search-item group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              this.selectedIndex === globalIdx ? 'bg-flow-surface-hover border border-flow-accent/40' : 'hover:bg-flow-surface-hover/60 border border-transparent'
            }"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0 pr-2">
              <div class="w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'done' ? 'bg-[#34D399]' : 'bg-flow-accent'}"></div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-flow-text-primary text-sm truncate ${t.status === 'done' ? 'line-through text-flow-text-muted' : ''}">
                  ${escapeHtml(t.title)}
                </div>
                <div class="flex items-center gap-2 text-xs text-flow-text-muted mt-0.5">
                  ${project ? `<span>${escapeHtml(project.name)}</span> •` : ''}
                  <span>${t.status.replace('_', ' ')}</span>
                  ${t.dueDate ? `• <span>Due ${t.dueDate}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              ${getPriorityBadge(t.priority)}
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;

    // Attach click events
    container.querySelectorAll('.search-item').forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.searchIndex);
        this.selectedIndex = idx;
        this.selectCurrent();
      });
    });
  }

  navigate(direction) {
    if (this.results.length === 0) return;
    this.selectedIndex = (this.selectedIndex + direction + this.results.length) % this.results.length;

    const items = this.modalEl.querySelectorAll('.search-item');
    items.forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.classList.add('bg-flow-surface-hover', 'border-flow-accent/40');
        item.classList.remove('border-transparent');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('bg-flow-surface-hover', 'border-flow-accent/40');
        item.classList.add('border-transparent');
      }
    });
  }

  selectCurrent() {
    if (this.results.length === 0 || !this.results[this.selectedIndex]) return;
    const selected = this.results[this.selectedIndex];

    modal.close(this.modalEl);

    if (selected.type === 'project') {
      window.location.hash = `#project/${selected.item.id}`;
    } else if (selected.type === 'task') {
      taskModal.openEdit(selected.item.id);
    }
  }
}

export const searchModal = new SearchModal();
