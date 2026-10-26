/**
 * FLOW - Projects Page View (Grid & List with Filters)
 */

import { state } from '../state.js';
import { projectModal } from '../components/projectModal.js';
import { confirmModal } from '../components/confirmModal.js';
import { toast } from '../components/toast.js';
import {
  escapeHtml,
  getProjectStatusBadge,
  formatShortDate,
} from '../utils.js';

export function renderProjectsView(container) {
  const filter = state.projectFilter;

  // Filter projects by search and status
  let filteredProjects = state.projects.filter((p) => {
    if (filter.status !== 'all' && p.status !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description && p.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const totalCount = state.projects.length;
  const activeCount = state.projects.filter((p) => p.status === 'active').length;
  const onHoldCount = state.projects.filter((p) => p.status === 'on_hold').length;
  const completedCount = state.projects.filter((p) => p.status === 'completed').length;

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-flow-border/60 pb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-flow-text-primary">Projects</h1>
          <p class="text-sm text-flow-text-secondary mt-1">Organize client assignments, track deadlines, and monitor completion progress.</p>
        </div>
        <button id="projects-btn-new" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle self-start sm:self-auto">
          <i data-lucide="folder-plus" class="w-4 h-4"></i>
          <span>New Project</span>
        </button>
      </div>

      <!-- Controls & Filter Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-flow-surface-primary border border-flow-border">
        <!-- Status Tabs -->
        <div class="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0" id="project-status-tabs">
          <button data-status="all" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter.status === 'all'
              ? 'bg-flow-surface-hover text-flow-text-primary border border-flow-border'
              : 'text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover/50'
          }">
            All <span class="ml-1 text-[11px] px-1.5 py-0.2 rounded bg-flow-surface-elevated text-flow-text-muted">${totalCount}</span>
          </button>
          <button data-status="active" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter.status === 'active'
              ? 'bg-flow-surface-hover text-flow-text-primary border border-flow-border'
              : 'text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover/50'
          }">
            Active <span class="ml-1 text-[11px] px-1.5 py-0.2 rounded bg-flow-surface-elevated text-flow-text-muted">${activeCount}</span>
          </button>
          <button data-status="on_hold" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter.status === 'on_hold'
              ? 'bg-flow-surface-hover text-flow-text-primary border border-flow-border'
              : 'text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover/50'
          }">
            On Hold <span class="ml-1 text-[11px] px-1.5 py-0.2 rounded bg-flow-surface-elevated text-flow-text-muted">${onHoldCount}</span>
          </button>
          <button data-status="completed" class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter.status === 'completed'
              ? 'bg-flow-surface-hover text-flow-text-primary border border-flow-border'
              : 'text-flow-text-secondary hover:text-flow-text-primary hover:bg-flow-surface-hover/50'
          }">
            Completed <span class="ml-1 text-[11px] px-1.5 py-0.2 rounded bg-flow-surface-elevated text-flow-text-muted">${completedCount}</span>
          </button>
        </div>

        <!-- Search & View Mode Toggle -->
        <div class="flex items-center gap-3">
          <div class="relative flex-1 md:w-64">
            <i data-lucide="search" class="w-4 h-4 text-flow-text-muted absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input
              type="text"
              id="project-search-input"
              value="${escapeHtml(filter.search)}"
              placeholder="Search projects..."
              class="w-full bg-flow-surface-elevated border border-flow-border focus:border-flow-accent rounded-lg pl-9 pr-3 py-1.5 text-xs text-flow-text-primary placeholder:text-flow-text-muted focus:outline-hidden transition-colors"
            />
          </div>

          <!-- View Toggle -->
          <div class="flex items-center p-0.5 rounded-lg bg-flow-surface-elevated border border-flow-border">
            <button
              id="btn-view-grid"
              class="p-1.5 rounded-md text-xs transition-colors ${filter.viewMode === 'grid' ? 'bg-flow-surface-hover text-flow-text-primary' : 'text-flow-text-muted hover:text-flow-text-primary'}"
              title="Grid View"
              aria-label="Grid View"
            >
              <i data-lucide="layout-grid" class="w-4 h-4"></i>
            </button>
            <button
              id="btn-view-list"
              class="p-1.5 rounded-md text-xs transition-colors ${filter.viewMode === 'list' ? 'bg-flow-surface-hover text-flow-text-primary' : 'text-flow-text-muted hover:text-flow-text-primary'}"
              title="List View"
              aria-label="List View"
            >
              <i data-lucide="list" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Projects Render Container -->
      <div id="projects-list-container">
        ${renderProjectsContent(filteredProjects, filter.viewMode)}
      </div>
    </div>
  `;

  // Bind Events
  container.querySelector('#projects-btn-new')?.addEventListener('click', () => {
    projectModal.openCreate();
  });

  // Search input
  const searchInput = container.querySelector('#project-search-input');
  searchInput?.addEventListener('input', () => {
    state.projectFilter.search = searchInput.value;
    renderProjectsView(container);
  });

  // Status tabs
  container.querySelectorAll('#project-status-tabs button[data-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.projectFilter.status = btn.dataset.status;
      renderProjectsView(container);
    });
  });

  // View mode
  container.querySelector('#btn-view-grid')?.addEventListener('click', () => {
    state.projectFilter.viewMode = 'grid';
    renderProjectsView(container);
  });

  container.querySelector('#btn-view-list')?.addEventListener('click', () => {
    state.projectFilter.viewMode = 'list';
    renderProjectsView(container);
  });

  // Edit and Delete buttons on cards
  container.querySelectorAll('[data-edit-project-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      projectModal.openEdit(btn.dataset.editProjectId);
    });
  });

  container.querySelectorAll('[data-delete-project-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const projId = btn.dataset.deleteProjectId;
      const proj = state.getProject(projId);
      if (!proj) return;

      const tasksCount = state.getTasksForProject(proj.id).length;
      confirmModal.show({
        title: 'Delete Project',
        message: `Are you sure you want to delete "${proj.name}"? This will permanently delete ${tasksCount} associated task${tasksCount === 1 ? '' : 's'}.`,
        confirmText: 'Delete Project',
        confirmStyle: 'danger',
        onConfirm: () => {
          state.deleteProject(proj.id);
          toast.info(`Project "${proj.name}" deleted.`);
        },
      });
    });
  });
}

function renderProjectsContent(projects, viewMode) {
  if (projects.length === 0) {
    return `
      <div class="py-16 text-center rounded-xl border border-dashed border-flow-border bg-flow-surface-primary">
        <i data-lucide="folder-x" class="w-10 h-10 mx-auto text-flow-text-muted mb-3 opacity-60"></i>
        <h3 class="text-sm font-semibold text-flow-text-primary">No projects match the criteria</h3>
        <p class="text-xs text-flow-text-secondary mt-1">Try resetting filters or search terms.</p>
        <button id="btn-reset-proj-filters" class="mt-4 px-3 py-1.5 text-xs text-flow-accent hover:bg-flow-surface-hover rounded-lg border border-flow-border font-medium transition-colors">
          Reset Filters
        </button>
      </div>
    `;
  }

  if (viewMode === 'list') {
    return `
      <div class="rounded-xl border border-flow-border bg-flow-surface-primary overflow-hidden divide-y divide-flow-border/50">
        ${projects
          .map((p) => {
            const progress = state.getProjectProgress(p.id);
            return `
            <div class="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-flow-surface-hover/50 transition-colors gap-4">
              <a href="#project/${p.id}" class="flex items-center gap-3.5 flex-1 min-w-0">
                <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${p.color || '#8AB4F8'};"></span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-flow-text-primary group-hover:text-flow-accent transition-colors truncate">
                      ${escapeHtml(p.name)}
                    </h3>
                    ${getProjectStatusBadge(p.status)}
                  </div>
                  <p class="text-xs text-flow-text-secondary truncate mt-0.5">${p.description ? escapeHtml(p.description) : 'No description'}</p>
                </div>
              </a>

              <div class="flex items-center gap-6 text-xs text-flow-text-muted self-end sm:self-center">
                <!-- Progress bar and count -->
                <div class="w-32 hidden md:block">
                  <div class="flex items-center justify-between text-[11px] mb-1">
                    <span>${progress.completed}/${progress.total} tasks</span>
                    <span class="font-medium text-flow-text-primary">${progress.percentage}%</span>
                  </div>
                  <div class="w-full h-1.5 rounded-full bg-flow-surface-elevated overflow-hidden">
                    <div class="h-full rounded-full" style="width: ${progress.percentage}%; background-color: ${p.color || '#8AB4F8'};"></div>
                  </div>
                </div>

                <div class="w-24 text-right">
                  ${p.deadline ? `<span>Due ${formatShortDate(p.deadline)}</span>` : '<span class="text-flow-text-muted">No date</span>'}
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    data-edit-project-id="${p.id}"
                    class="p-1.5 text-flow-text-muted hover:text-flow-text-primary hover:bg-flow-surface-elevated rounded-md transition-colors"
                    title="Edit project"
                  >
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                  </button>
                  <button
                    type="button"
                    data-delete-project-id="${p.id}"
                    class="p-1.5 text-flow-text-muted hover:text-[#F87171] hover:bg-[#450A0A]/40 rounded-md transition-colors"
                    title="Delete project"
                  >
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;
  }

  // Grid view
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      ${projects
        .map((p) => {
          const progress = state.getProjectProgress(p.id);
          return `
          <div class="group relative flex flex-col justify-between p-5 rounded-xl bg-flow-surface-primary border border-flow-border hover:border-flow-accent/40 hover:bg-flow-surface-hover/30 transition-all duration-150">
            <div>
              <div class="flex items-start justify-between gap-3 mb-2.5">
                <a href="#project/${p.id}" class="flex items-center gap-2.5 min-w-0 flex-1">
                  <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${p.color || '#8AB4F8'};"></span>
                  <h3 class="font-semibold text-flow-text-primary text-sm truncate group-hover:text-flow-accent transition-colors">
                    ${escapeHtml(p.name)}
                  </h3>
                </a>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    data-edit-project-id="${p.id}"
                    class="p-1 text-flow-text-muted hover:text-flow-text-primary hover:bg-flow-surface-elevated rounded-md transition-colors"
                    title="Edit project"
                  >
                    <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  </button>
                  <button
                    type="button"
                    data-delete-project-id="${p.id}"
                    class="p-1 text-flow-text-muted hover:text-[#F87171] hover:bg-[#450A0A]/40 rounded-md transition-colors"
                    title="Delete project"
                  >
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                ${getProjectStatusBadge(p.status)}
              </div>

              <p class="text-xs text-flow-text-secondary line-clamp-2 leading-relaxed mb-4 h-8">
                ${p.description ? escapeHtml(p.description) : 'No description provided.'}
              </p>
            </div>

            <div>
              <!-- Progress bar -->
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="text-flow-text-muted">${progress.completed} of ${progress.total} tasks</span>
                <span class="font-semibold text-flow-text-primary font-mono">${progress.percentage}%</span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-flow-surface-elevated overflow-hidden mb-3">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  style="width: ${progress.percentage}%; background-color: ${p.color || '#8AB4F8'};"
                ></div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-flow-border/50 text-[11px] text-flow-text-muted">
                <span>Start: ${p.startDate ? formatShortDate(p.startDate) : 'N/A'}</span>
                <span>Deadline: ${p.deadline ? formatShortDate(p.deadline) : 'N/A'}</span>
              </div>
            </div>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
}
