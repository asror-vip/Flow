/**
 * FLOW - Models and Initial Workspace Data
 */

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUSES.TODO]: 'To Do',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.IN_REVIEW]: 'In Review',
  [TASK_STATUSES.DONE]: 'Done',
};

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITIES.LOW]: 'Low',
  [TASK_PRIORITIES.MEDIUM]: 'Medium',
  [TASK_PRIORITIES.HIGH]: 'High',
};

export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUSES.ACTIVE]: 'Active',
  [PROJECT_STATUSES.ON_HOLD]: 'On Hold',
  [PROJECT_STATUSES.COMPLETED]: 'Completed',
};

export const PROJECT_COLORS = [
  '#8AB4F8', // Blue (Accent)
  '#A78BFA', // Purple
  '#34D399', // Emerald
  '#FBBF24', // Amber
  '#F472B6', // Pink
  '#38BDF8', // Sky
  '#9CA3AF', // Gray
];

// Helper to generate dynamic dates relative to today
const today = new Date();
const formatDate = (offsetDays) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SETTINGS = {
  displayName: 'Alex Vance',
  role: 'Product Designer & Developer',
  defaultView: 'overview',
  density: 'comfortable', // 'comfortable' | 'compact'
  reducedMotion: false,
};

export const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Aura Mobile Website',
    description: 'Immersive 3D interactive showcase for mobile flagship device launch.',
    status: PROJECT_STATUSES.ACTIVE,
    startDate: formatDate(-14),
    deadline: formatDate(6),
    color: '#8AB4F8',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Personal Portfolio 2026',
    description: 'Editorial-grade portfolio demonstrating case studies, code samples, and typography.',
    status: PROJECT_STATUSES.ACTIVE,
    startDate: formatDate(-20),
    deadline: formatDate(12),
    color: '#A78BFA',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'proj-3',
    name: 'Restaurant Ordering Concept',
    description: 'Tablet-first kiosk application for rapid kitchen ordering and checkout flows.',
    status: PROJECT_STATUSES.ACTIVE,
    startDate: formatDate(-8),
    deadline: formatDate(18),
    color: '#34D399',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'proj-4',
    name: 'Design System & Tokens',
    description: 'Centralized UI primitives, accessible color system, and layout grid specifications.',
    status: PROJECT_STATUSES.COMPLETED,
    startDate: formatDate(-45),
    deadline: formatDate(-5),
    color: '#FBBF24',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    projectId: 'proj-1',
    title: 'Refine mobile navigation drawer gestures',
    description: 'Ensure touch swipes work smoothly with CSS touch-action and backdrop blur transitions on iOS Safari.',
    status: TASK_STATUSES.IN_PROGRESS,
    priority: TASK_PRIORITIES.HIGH,
    dueDate: formatDate(1),
    tags: ['ux', 'mobile', 'frontend'],
    order: 0,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'task-102',
    projectId: 'proj-1',
    title: 'Review 3D product card interactions',
    description: 'Verify frame rates when rotating 3D canvas viewport on high-density displays.',
    status: TASK_STATUSES.TODO,
    priority: TASK_PRIORITIES.MEDIUM,
    dueDate: formatDate(3),
    tags: ['3d', 'performance'],
    order: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'task-103',
    projectId: 'proj-1',
    title: 'Optimize product photography assets for Retina',
    description: 'Generate WebP format responsive picture sources with WebGL fallback images.',
    status: TASK_STATUSES.IN_REVIEW,
    priority: TASK_PRIORITIES.MEDIUM,
    dueDate: formatDate(0), // Today
    tags: ['assets', 'performance'],
    order: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'task-104',
    projectId: 'proj-1',
    title: 'Configure SEO meta tags and open graph assets',
    description: 'Verify Twitter card summaries, canonical URLs, and schema.org structured data.',
    status: TASK_STATUSES.DONE,
    priority: TASK_PRIORITIES.LOW,
    dueDate: formatDate(-2),
    tags: ['seo', 'marketing'],
    order: 0,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'task-201',
    projectId: 'proj-2',
    title: 'Prepare portfolio case study screenshots',
    description: 'Capture high-fidelity mockups of client web apps at 2560x1440 with realistic dummy content.',
    status: TASK_STATUSES.IN_PROGRESS,
    priority: TASK_PRIORITIES.HIGH,
    dueDate: formatDate(-1), // Overdue
    tags: ['design', 'portfolio'],
    order: 1,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'task-202',
    projectId: 'proj-2',
    title: 'Test dark theme contrast ratios for accessibility',
    description: 'Audit all text elements with WCAG AAA standards using Chrome DevTools Lighthouse.',
    status: TASK_STATUSES.IN_REVIEW,
    priority: TASK_PRIORITIES.MEDIUM,
    dueDate: formatDate(2),
    tags: ['a11y', 'typography'],
    order: 1,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'task-203',
    projectId: 'proj-2',
    title: 'Write project retrospective descriptions',
    description: 'Articulate design decisions, constraints, and measurable impact for each portfolio case study.',
    status: TASK_STATUSES.TODO,
    priority: TASK_PRIORITIES.LOW,
    dueDate: formatDate(5),
    tags: ['content'],
    order: 1,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'task-301',
    projectId: 'proj-3',
    title: 'Build table-side order modifier modal flow',
    description: 'Support multi-select condiments, portion sizes, and dietary preference tags with instant price recalculation.',
    status: TASK_STATUSES.TODO,
    priority: TASK_PRIORITIES.HIGH,
    dueDate: formatDate(4),
    tags: ['ui', 'forms'],
    order: 2,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'task-302',
    projectId: 'proj-3',
    title: 'Conduct offline kitchen ticket printer stress test',
    description: 'Simulate connection drops and verify that offline queue syncs when WebSocket reconnects.',
    status: TASK_STATUSES.DONE,
    priority: TASK_PRIORITIES.MEDIUM,
    dueDate: formatDate(-4),
    tags: ['network', 'testing'],
    order: 1,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'task-401',
    projectId: 'proj-4',
    title: 'Document color tokens and semantic usage guides',
    description: 'Publish documentation detailing surface hierarchy, text contrast, and restrained accent usage.',
    status: TASK_STATUSES.DONE,
    priority: TASK_PRIORITIES.LOW,
    dueDate: formatDate(-8),
    tags: ['tokens', 'docs'],
    order: 2,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'task-402',
    projectId: 'proj-4',
    title: 'Audit base button component focus rings',
    description: 'Standardize visible focus rings across button variants for full keyboard accessibility.',
    status: TASK_STATUSES.DONE,
    priority: TASK_PRIORITIES.MEDIUM,
    dueDate: formatDate(-6),
    tags: ['a11y', 'components'],
    order: 3,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

export const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'task_moved',
    title: 'Moved "Refine mobile navigation drawer gestures" to In Progress',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45m ago
    projectId: 'proj-1',
  },
  {
    id: 'act-2',
    type: 'task_completed',
    title: 'Completed "Optimize product photography assets for Retina"',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), // 3h ago
    projectId: 'proj-1',
  },
  {
    id: 'act-3',
    type: 'task_created',
    title: 'Created new task "Build table-side order modifier modal flow"',
    timestamp: new Date(Date.now() - 18 * 3600000).toISOString(), // 18h ago
    projectId: 'proj-3',
  },
  {
    id: 'act-4',
    type: 'project_updated',
    title: 'Updated deadline for Aura Mobile Website',
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(), // 1.5d ago
    projectId: 'proj-1',
  },
];
