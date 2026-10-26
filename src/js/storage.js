/**
 * FLOW - LocalStorage Persistence Layer
 */

import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_SETTINGS,
} from './models.js';

const STORAGE_KEYS = {
  PROJECTS: 'flow_workspace_projects_v1',
  TASKS: 'flow_workspace_tasks_v1',
  ACTIVITIES: 'flow_workspace_activities_v1',
  SETTINGS: 'flow_workspace_settings_v1',
};

export const storage = {
  getProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [...INITIAL_PROJECTS];
    } catch (e) {
      console.warn('Failed to read projects from localStorage:', e);
      return [...INITIAL_PROJECTS];
    }
  },

  saveProjects(projects) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  },

  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [...INITIAL_TASKS];
    } catch (e) {
      console.warn('Failed to read tasks from localStorage:', e);
      return [...INITIAL_TASKS];
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }
  },

  getActivities() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [...INITIAL_ACTIVITIES];
    } catch (e) {
      console.warn('Failed to read activities from localStorage:', e);
      return [...INITIAL_ACTIVITIES];
    }
  },

  saveActivities(activities) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities to localStorage:', e);
    }
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...INITIAL_SETTINGS, ...JSON.parse(data) } : { ...INITIAL_SETTINGS };
    } catch (e) {
      console.warn('Failed to read settings from localStorage:', e);
      return { ...INITIAL_SETTINGS };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  },

  resetAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
    return {
      projects: [...INITIAL_PROJECTS],
      tasks: [...INITIAL_TASKS],
      activities: [...INITIAL_ACTIVITIES],
      settings: { ...INITIAL_SETTINGS },
    };
  },

  exportWorkspace() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      tasks: this.getTasks(),
      activities: this.getActivities(),
      settings: this.getSettings(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importWorkspace(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid workspace format. Missing projects or tasks.');
      }
      this.saveProjects(parsed.projects);
      this.saveTasks(parsed.tasks);
      if (Array.isArray(parsed.activities)) this.saveActivities(parsed.activities);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return {
        projects: parsed.projects,
        tasks: parsed.tasks,
        activities: parsed.activities || [],
        settings: parsed.settings || { ...INITIAL_SETTINGS },
      };
    } catch (err) {
      throw new Error('Failed to import workspace data: ' + err.message);
    }
  }
};
