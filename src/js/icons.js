/**
 * FLOW - Curated Lucide Icons (Optimized Bundle)
 */

import {
  LayoutDashboard,
  Folder,
  FolderPlus,
  FolderX,
  Columns3,
  CheckSquare,
  Calendar,
  Settings,
  X,
  Search,
  Bell,
  Plus,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Trash2,
  Check,
  Clock,
  Eye,
  Circle,
  AlertTriangle,
  AlertCircle,
  Activity,
  Download,
  Upload,
  Menu,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List,
  Inbox,
  CheckCircle2,
  PlusCircle,
  createIcons,
} from 'lucide';

export const flowIcons = {
  LayoutDashboard,
  Folder,
  FolderPlus,
  FolderX,
  Columns3,
  CheckSquare,
  Calendar,
  Settings,
  X,
  Search,
  Bell,
  Plus,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Trash2,
  Check,
  Clock,
  Eye,
  Circle,
  AlertTriangle,
  AlertCircle,
  Activity,
  Download,
  Upload,
  Menu,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List,
  Inbox,
  CheckCircle2,
  PlusCircle,
};

export function renderIcons(root = document) {
  try {
    createIcons({ icons: flowIcons, root });
  } catch (err) {
    console.warn('Lucide icon rendering warning:', err);
  }
}
