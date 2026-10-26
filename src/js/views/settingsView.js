/**
 * FLOW - Settings & Workspace Preferences View
 */

import { state } from '../state.js';
import { storage } from '../storage.js';
import { confirmModal } from '../components/confirmModal.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils.js';

export function renderSettingsView(container) {
  const settings = state.settings;

  container.innerHTML = `
    <div class="max-w-3xl space-y-8 animate-fadeIn pb-12">
      <!-- Header -->
      <div class="border-b border-flow-border/60 pb-6">
        <h1 class="text-2xl font-bold tracking-tight text-flow-text-primary">Settings</h1>
        <p class="text-sm text-flow-text-secondary mt-1">Configure your workspace preferences, interface density, and local storage options.</p>
      </div>

      <!-- Profile & Identity Section -->
      <div class="p-6 rounded-xl bg-flow-surface-primary border border-flow-border space-y-4">
        <div>
          <h2 class="text-base font-semibold text-flow-text-primary">Workspace Identity</h2>
          <p class="text-xs text-flow-text-secondary mt-0.5">Personalize the greeting and signature in your local workspace.</p>
        </div>

        <form id="settings-profile-form" class="space-y-4 pt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="settings-input-name" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                id="settings-input-name"
                value="${escapeHtml(settings.displayName || '')}"
                placeholder="e.g. Alex Vance"
                class="w-full bg-flow-surface-elevated border border-flow-border focus:border-flow-accent rounded-lg px-3.5 py-2 text-sm text-flow-text-primary focus:outline-hidden transition-colors"
              />
            </div>

            <div>
              <label for="settings-input-role" class="block text-xs font-medium text-flow-text-secondary uppercase tracking-wider mb-1.5">
                Professional Role / Title
              </label>
              <input
                type="text"
                id="settings-input-role"
                value="${escapeHtml(settings.role || '')}"
                placeholder="e.g. Senior Product Designer"
                class="w-full bg-flow-surface-elevated border border-flow-border focus:border-flow-accent rounded-lg px-3.5 py-2 text-sm text-flow-text-primary focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              class="px-4 py-2 text-xs font-semibold text-black bg-flow-accent hover:bg-flow-accent-hover rounded-lg transition-colors shadow-subtle"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      <!-- Workspace Preferences Section -->
      <div class="p-6 rounded-xl bg-flow-surface-primary border border-flow-border space-y-5">
        <div>
          <h2 class="text-base font-semibold text-flow-text-primary">Interface Preferences</h2>
          <p class="text-xs text-flow-text-secondary mt-0.5">Customize default views and information density.</p>
        </div>

        <!-- Default Landing View -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <div class="text-sm font-medium text-flow-text-primary">Default Landing Page</div>
            <div class="text-xs text-flow-text-secondary">The view displayed upon opening FLOW</div>
          </div>
          <select
            id="settings-select-default-view"
            class="bg-flow-surface-elevated border border-flow-border text-flow-text-primary text-xs rounded-lg px-3 py-2 focus:border-flow-accent focus:outline-hidden transition-colors"
          >
            <option value="overview" ${settings.defaultView === 'overview' ? 'selected' : ''}>Overview Dashboard</option>
            <option value="projects" ${settings.defaultView === 'projects' ? 'selected' : ''}>Projects</option>
            <option value="kanban" ${settings.defaultView === 'kanban' ? 'selected' : ''}>Kanban Board</option>
            <option value="tasks" ${settings.defaultView === 'tasks' ? 'selected' : ''}>My Tasks</option>
            <option value="calendar" ${settings.defaultView === 'calendar' ? 'selected' : ''}>Calendar</option>
          </select>
        </div>

        <div class="border-t border-flow-border/50"></div>

        <!-- Task Density -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="text-sm font-medium text-flow-text-primary">Card & List Density</div>
            <div class="text-xs text-flow-text-secondary">Adjust spacing and padding for tasks</div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              data-density="comfortable"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                settings.density !== 'compact'
                  ? 'bg-flow-accent text-black font-semibold'
                  : 'bg-flow-surface-elevated text-flow-text-secondary hover:text-flow-text-primary border border-flow-border'
              }"
            >
              Comfortable
            </button>
            <button
              type="button"
              data-density="compact"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                settings.density === 'compact'
                  ? 'bg-flow-accent text-black font-semibold'
                  : 'bg-flow-surface-elevated text-flow-text-secondary hover:text-flow-text-primary border border-flow-border'
              }"
            >
              Compact
            </button>
          </div>
        </div>

        <div class="border-t border-flow-border/50"></div>

        <!-- Reduced Motion -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="text-sm font-medium text-flow-text-primary">Reduced Motion</div>
            <div class="text-xs text-flow-text-secondary">Minimize micro-animations and transitions</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="settings-toggle-motion"
              class="sr-only peer"
              ${settings.reducedMotion ? 'checked' : ''}
            />
            <div class="w-11 h-6 bg-flow-surface-elevated peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-flow-text-primary after:border-flow-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-flow-accent peer-checked:after:bg-black"></div>
          </label>
        </div>
      </div>

      <!-- Data Persistence & Management Section -->
      <div class="p-6 rounded-xl bg-flow-surface-primary border border-flow-border space-y-5">
        <div>
          <h2 class="text-base font-semibold text-flow-text-primary">Data & Local Storage</h2>
          <p class="text-xs text-flow-text-secondary mt-0.5 leading-relaxed">
            FLOW operates completely client-side. All projects, tasks, and settings are saved securely in your browser's <code class="text-flow-accent bg-flow-surface-elevated px-1.5 py-0.5 rounded text-[11px] font-mono">localStorage</code>.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-3 p-3.5 rounded-lg bg-flow-surface-elevated border border-flow-border text-center text-xs">
          <div>
            <div class="text-flow-text-muted text-[11px]">Projects</div>
            <div class="text-base font-bold text-flow-text-primary font-mono mt-0.5">${state.projects.length}</div>
          </div>
          <div>
            <div class="text-flow-text-muted text-[11px]">Tasks</div>
            <div class="text-base font-bold text-flow-text-primary font-mono mt-0.5">${state.tasks.length}</div>
          </div>
          <div>
            <div class="text-flow-text-muted text-[11px]">Activity Logs</div>
            <div class="text-base font-bold text-flow-text-primary font-mono mt-0.5">${state.activities.length}</div>
          </div>
        </div>

        <!-- Export & Import Controls -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div>
            <div class="text-sm font-medium text-flow-text-primary">Workspace Backup</div>
            <div class="text-xs text-flow-text-secondary">Export your data to JSON or restore a previous snapshot</div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              id="settings-btn-export"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-flow-text-secondary hover:text-flow-text-primary bg-flow-surface-elevated hover:bg-flow-surface-hover rounded-lg border border-flow-border transition-colors"
            >
              <i data-lucide="download" class="w-3.5 h-3.5 text-flow-accent"></i>
              <span>Export JSON</span>
            </button>
            <label
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-flow-text-secondary hover:text-flow-text-primary bg-flow-surface-elevated hover:bg-flow-surface-hover rounded-lg border border-flow-border transition-colors cursor-pointer"
            >
              <i data-lucide="upload" class="w-3.5 h-3.5"></i>
              <span>Import JSON</span>
              <input type="file" id="settings-file-import" accept=".json" class="hidden" />
            </label>
          </div>
        </div>

        <div class="border-t border-flow-border/50"></div>

        <!-- Reset Workspace -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div class="text-sm font-medium text-[#F87171]">Reset Workspace</div>
            <div class="text-xs text-flow-text-secondary">Restore the original demo portfolio projects and sample tasks</div>
          </div>
          <button
            type="button"
            id="settings-btn-reset"
            class="px-3.5 py-2 text-xs font-medium text-[#F87171] hover:bg-[#450A0A]/60 rounded-lg border border-[#7F1D1D]/40 transition-colors self-start sm:self-auto"
          >
            Reset to Sample Data
          </button>
        </div>
      </div>
    </div>
  `;

  // Profile Form submit
  const profileForm = container.querySelector('#settings-profile-form');
  profileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#settings-input-name').value.trim();
    const role = container.querySelector('#settings-input-role').value.trim();
    state.updateSettings({ displayName: name, role });
    toast.success('Profile preferences updated.');
  });

  // Default view select
  const defViewSelect = container.querySelector('#settings-select-default-view');
  defViewSelect?.addEventListener('change', () => {
    state.updateSettings({ defaultView: defViewSelect.value });
    toast.info(`Default view set to ${defViewSelect.value}.`);
  });

  // Density buttons
  container.querySelectorAll('button[data-density]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const density = btn.dataset.density;
      state.updateSettings({ density });
      renderSettingsView(container);
      toast.info(`Interface density set to ${density}.`);
    });
  });

  // Reduced motion toggle
  const motionToggle = container.querySelector('#settings-toggle-motion');
  motionToggle?.addEventListener('change', () => {
    state.updateSettings({ reducedMotion: motionToggle.checked });
    toast.info(`Reduced motion ${motionToggle.checked ? 'enabled' : 'disabled'}.`);
  });

  // Export workspace
  container.querySelector('#settings-btn-export')?.addEventListener('click', () => {
    storage.exportWorkspace();
    toast.success('Workspace exported to JSON.');
  });

  // Import workspace
  const fileImport = container.querySelector('#settings-file-import');
  fileImport?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        state.importWorkspace(event.target.result);
        toast.success('Workspace data restored successfully.');
        renderSettingsView(container);
      } catch (err) {
        toast.error(err.message);
      }
    };
    reader.readAsText(file);
  });

  // Reset workspace button
  container.querySelector('#settings-btn-reset')?.addEventListener('click', () => {
    confirmModal.show({
      title: 'Reset Workspace to Sample Data?',
      message: 'This will erase all custom projects and tasks created in this browser and restore the initial sample portfolio workspace.',
      confirmText: 'Reset Everything',
      confirmStyle: 'danger',
      onConfirm: () => {
        state.resetToSampleData();
        toast.info('Workspace reset to initial sample state.');
        window.location.hash = '#overview';
      },
    });
  });
}
