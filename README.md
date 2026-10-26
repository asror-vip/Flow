# FLOW — Premium Project Management Workspace

FLOW is a portfolio-quality, dark minimalist productivity workspace designed for freelancers, designers, developers, and small creative teams to organize projects, manage deliverables, track deadlines, and monitor progress.

---

## 🎨 Visual Design System

Built strictly following the requested dark minimalist design tokens:

- **App Background:** `#090A0C`
- **Sidebar Background:** `#0D0F12`
- **Primary Surface:** `#12151A`
- **Elevated Surface:** `#181C22`
- **Hover Surface:** `#20252D`
- **Primary Text:** `#F4F5F7`
- **Secondary Text:** `#A1A8B3`
- **Muted Text:** `#717987`
- **Border:** `#282D35`
- **Primary Accent:** `#8AB4F8`
- **Accent Hover:** `#A6C6FA`
- **Subtle Accent Background:** `#172337`
- **Typography:** Inter (Google Fonts)
- **Icons:** Curated Lucide SVG icons

---

## 🚀 Key Features

1. **Executive Dashboard (`#overview`):**
   - Time-aware personalized greeting (*Good morning / afternoon / evening*).
   - 4 live KPI metric cards calculated from workspace state: Active Projects, In Progress Tasks, Completed This Week, Approaching Deadlines.
   - Interactive Weekly Task Velocity SVG chart with tooltips and completion trendline.
   - Active projects progress overview with live completion percentages.
   - Priority attention required list with direct checkbox completion.
   - Live activity history log.

2. **Project Management (`#projects`):**
   - Grid and List view switcher.
   - Status filters: All, Active, On Hold, Completed.
   - Full-text instant search across project names and descriptions.
   - Create & Edit project modal with color accent selector and validation.
   - Safe delete confirmation modal detailing associated tasks.

3. **Project Detail Workspace (`#project/:id`):**
   - Breadcrumb navigation.
   - Project header with status badge, start date, and target deadline.
   - Dynamic progress bar derived from associated task completion ratios.
   - Status counts breakdown (To Do, In Progress, In Review, Done).
   - Dedicated task list with quick "Add Task to Project".
   - Filtered project activity history.

4. **Kanban Task Board (`#kanban`):**
   - 4 workflow stages: **To Do**, **In Progress**, **In Review**, **Done**.
   - **Genuine HTML5 Drag and Drop** with visual drop indicators and column highlight.
   - Accessible keyboard/mobile fallback dropdown on every card for moving tasks.
   - Real-time state synchronization, project progress recalculation, and activity logging.
   - Filter board by specific project or view all.

5. **My Tasks Page (`#tasks`):**
   - Multi-parameter filter bar:
     - Search by title, description, or `#tag`.
     - Filter by Project.
     - Filter by Status (To Do, In Progress, In Review, Done).
     - Filter by Priority (High, Medium, Low).
     - Filter by Due Date (Overdue, Due Today, Due This Week, No Date).
     - Sort by Due Date, Priority, Title, or Recently Updated.
   - One-click task completion toggle.
   - Detailed task edit, metadata view, and deletion with confirmation.

6. **Calendar Workspace (`#calendar`):**
   - Monthly calendar grid calculated for any month and year.
   - Month navigation (`<`, `>`, `Today` return button).
   - Visual priority badges and task chips on date cells.
   - Selected date Agenda panel on the side.
   - Quick "+ Add Task for this date" action.

7. **Global Search Modal (`Ctrl+K` / `⌘K`):**
   - Real-time search across task titles, descriptions, tags, and project names.
   - Grouped results (Projects & Tasks).
   - Keyboard navigation (`↑`, `↓`, `Enter` to open, `Escape` to close).

8. **Notifications & Alerts Dropdown:**
   - Real-time badge counter on the top bar bell icon.
   - Displays overdue task alerts, tasks due today, and recent activities.
   - Direct click to open the task details.

9. **Settings & Workspace Persistence (`#settings`):**
   - Display name and role customization.
   - Default landing page preference.
   - Interface density toggle (Comfortable vs Compact).
   - Reduced motion toggle respecting accessibility.
   - Complete local persistence via `localStorage`.
   - **Export Workspace as JSON** and **Import Workspace from JSON**.
   - Safe "Reset Workspace to Original Sample Data" with confirmation modal.

---

## 🛠️ Technology Stack

- **Structure:** Semantic HTML5
- **Logic & State:** Vanilla JavaScript (ES6+ modular architecture, Reactive Central State Store)
- **Styling:** Tailwind CSS v3 + PostCSS + Autoprefixer
- **Icons:** Curated Lucide Icons
- **Storage:** Browser `localStorage` (reliable client-side data persistence)
- **Dev Server & Build:** Vite

---

## 💻 Running the Application

### Development Server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build:
```bash
npm run build
```
Builds the minified, production-ready assets to `dist/`.
