/**
 * FLOW - Reactive Central State Store
 */

import { storage } from './storage.js';
import {
  TASK_STATUSES,
  PROJECT_STATUSES,
} from './models.js';

class StateStore {
  constructor() {
    this.projects = storage.getProjects();
    this.tasks = storage.getTasks();
    this.activities = storage.getActivities();
    this.settings = storage.getSettings();
    this.listeners = new Set();
    this.currentView = 'overview';
    this.selectedProjectId = null;
    this.taskFilter = {
      search: '',
      project: 'all',
      status: 'all',
      priority: 'all',
      dueDate: 'all',
      sort: 'due_date',
    };
    this.projectFilter = {
      search: '',
      status: 'all',
      viewMode: 'grid', // 'grid' | 'list'
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(eventType = 'state_change', data = null) {
    this.listeners.forEach((listener) => {
      try {
        listener(this, eventType, data);
      } catch (err) {
        console.error('Error in state listener:', err);
      }
    });
  }

  // --- Read Methods & Computed Values ---

  getProject(id) {
    return this.projects.find((p) => p.id === id) || null;
  }

  getTasksForProject(projectId) {
    return this.tasks.filter((t) => t.projectId === projectId);
  }

  getTask(id) {
    return this.tasks.find((t) => t.id === id) || null;
  }

  getProjectProgress(projectId) {
    const tasks = this.getTasksForProject(projectId);
    if (tasks.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    const completed = tasks.filter((t) => t.status === TASK_STATUSES.DONE).length;
    const percentage = Math.round((completed / tasks.length) * 100);
    return {
      total: tasks.length,
      completed,
      percentage,
    };
  }

  getSummaryMetrics() {
    const activeProjects = this.projects.filter(
      (p) => p.status === PROJECT_STATUSES.ACTIVE
    ).length;

    const inProgressTasks = this.tasks.filter(
      (t) => t.status === TASK_STATUSES.IN_PROGRESS
    ).length;

    // Completed in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const completedThisWeek = this.tasks.filter((t) => {
      if (t.status !== TASK_STATUSES.DONE) return false;
      const updated = new Date(t.updatedAt || t.createdAt);
      return updated >= sevenDaysAgo;
    }).length;

    // Approaching deadlines: due within next 3 days, or overdue and not completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inThreeDays = new Date(today);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const approachingDeadlines = this.tasks.filter((t) => {
      if (t.status === TASK_STATUSES.DONE) return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate + 'T23:59:59');
      return due <= inThreeDays;
    }).length;

    return {
      activeProjects,
      inProgressTasks,
      completedThisWeek,
      approachingDeadlines,
    };
  }

  getWeeklyActivityData() {
    // Generate data for the last 7 days (Mon-Sun or past 7 days)
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Count tasks completed or created on this day
      const completedCount = this.tasks.filter((t) => {
        if (t.status !== TASK_STATUSES.DONE) return false;
        const updatedDate = (t.updatedAt || t.createdAt).split('T')[0];
        return updatedDate === dayStr;
      }).length;

      const activeCount = this.tasks.filter((t) => {
        const createdDate = t.createdAt.split('T')[0];
        return createdDate === dayStr;
      }).length;

      days.push({
        date: dayStr,
        dayName,
        completed: completedCount,
        active: activeCount,
        totalActivity: completedCount + activeCount,
      });
    }

    return days;
  }

  // --- Mutations ---

  createProject(data) {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: data.name.trim(),
      description: data.description ? data.description.trim() : '',
      status: data.status || PROJECT_STATUSES.ACTIVE,
      startDate: data.startDate || null,
      deadline: data.deadline || null,
      color: data.color || '#8AB4F8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.unshift(newProject);
    storage.saveProjects(this.projects);
    this.addActivity('project_created', `Created project "${newProject.name}"`, newProject.id);
    this.notify('project_created', newProject);
    return newProject;
  }

  updateProject(id, updates) {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const oldProject = this.projects[index];
    const updated = {
      ...oldProject,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.projects[index] = updated;
    storage.saveProjects(this.projects);
    this.addActivity('project_updated', `Updated project "${updated.name}"`, updated.id);
    this.notify('project_updated', updated);
    return updated;
  }

  deleteProject(id) {
    const project = this.getProject(id);
    if (!project) return false;

    // Delete associated tasks
    this.tasks = this.tasks.filter((t) => t.projectId !== id);
    storage.saveTasks(this.tasks);

    // Delete project
    this.projects = this.projects.filter((p) => p.id !== id);
    storage.saveProjects(this.projects);

    this.addActivity('project_deleted', `Deleted project "${project.name}"`);
    this.notify('project_deleted', { id, name: project.name });
    return true;
  }

  createTask(data) {
    const project = this.getProject(data.projectId);
    const newOrder = this.tasks.filter((t) => t.status === (data.status || TASK_STATUSES.TODO)).length;

    const newTask = {
      id: `task-${Date.now()}`,
      projectId: data.projectId,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      status: data.status || TASK_STATUSES.TODO,
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      order: newOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.push(newTask);
    storage.saveTasks(this.tasks);

    const projName = project ? ` in "${project.name}"` : '';
    this.addActivity('task_created', `Created task "${newTask.title}"${projName}`, newTask.projectId);
    this.notify('task_created', newTask);
    return newTask;
  }

  updateTask(id, updates) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const oldTask = this.tasks[index];
    const isStatusChanged = updates.status && updates.status !== oldTask.status;

    const updated = {
      ...oldTask,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.tasks[index] = updated;
    storage.saveTasks(this.tasks);

    if (isStatusChanged) {
      if (updated.status === TASK_STATUSES.DONE) {
        this.addActivity('task_completed', `Completed "${updated.title}"`, updated.projectId);
      } else {
        this.addActivity('task_moved', `Moved "${updated.title}" to ${updated.status.replace('_', ' ')}`, updated.projectId);
      }
    } else {
      this.addActivity('task_updated', `Updated "${updated.title}"`, updated.projectId);
    }

    this.notify('task_updated', updated);
    return updated;
  }

  moveTask(taskId, newStatus, targetTaskId = null) {
    const task = this.getTask(taskId);
    if (!task) return false;

    const oldStatus = task.status;
    const sameStatus = oldStatus === newStatus;

    task.status = newStatus;
    task.updatedAt = new Date().toISOString();

    // Reorder tasks in destination column
    const columnTasks = this.tasks.filter((t) => t.status === newStatus && t.id !== taskId);
    if (targetTaskId) {
      const targetIndex = columnTasks.findIndex((t) => t.id === targetTaskId);
      if (targetIndex !== -1) {
        columnTasks.splice(targetIndex, 0, task);
      } else {
        columnTasks.push(task);
      }
    } else {
      columnTasks.push(task);
    }

    columnTasks.forEach((t, idx) => {
      t.order = idx;
    });

    storage.saveTasks(this.tasks);

    if (!sameStatus) {
      if (newStatus === TASK_STATUSES.DONE) {
        this.addActivity('task_completed', `Completed "${task.title}"`, task.projectId);
      } else {
        this.addActivity('task_moved', `Moved "${task.title}" to ${newStatus.replace('_', ' ')}`, task.projectId);
      }
    }

    this.notify('task_moved', task);
    return true;
  }

  toggleTaskComplete(taskId) {
    const task = this.getTask(taskId);
    if (!task) return false;

    const newStatus = task.status === TASK_STATUSES.DONE ? TASK_STATUSES.TODO : TASK_STATUSES.DONE;
    return this.updateTask(taskId, { status: newStatus });
  }

  deleteTask(id) {
    const task = this.getTask(id);
    if (!task) return false;

    this.tasks = this.tasks.filter((t) => t.id !== id);
    storage.saveTasks(this.tasks);

    this.addActivity('task_deleted', `Deleted task "${task.title}"`, task.projectId);
    this.notify('task_deleted', { id, title: task.title });
    return true;
  }

  addActivity(type, title, projectId = null) {
    const newAct = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      timestamp: new Date().toISOString(),
      projectId,
    };
    this.activities.unshift(newAct);
    // Keep max 40 activity items
    if (this.activities.length > 40) {
      this.activities = this.activities.slice(0, 40);
    }
    storage.saveActivities(this.activities);
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    storage.saveSettings(this.settings);
    this.applySettingsToDOM();
    this.notify('settings_updated', this.settings);
  }

  applySettingsToDOM() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    if (this.settings.density === 'compact') {
      appEl.classList.add('density-compact');
    } else {
      appEl.classList.remove('density-compact');
    }

    if (this.settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }

  resetToSampleData() {
    const data = storage.resetAll();
    this.projects = data.projects;
    this.tasks = data.tasks;
    this.activities = data.activities;
    this.settings = data.settings;
    this.applySettingsToDOM();
    this.notify('workspace_reset');
  }

  importWorkspace(jsonData) {
    const data = storage.importWorkspace(jsonData);
    this.projects = data.projects;
    this.tasks = data.tasks;
    this.activities = data.activities;
    this.settings = data.settings;
    this.applySettingsToDOM();
    this.notify('workspace_imported');
  }
}

export const state = new StateStore();
