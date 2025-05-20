export interface Task {
  id: string;
  title: string;
  description?: string;
  isDone: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export type ViewMode = 'list' | 'board';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type ColorScheme = 'sunset' | 'ocean' | 'forest' | 'lavender';

export interface AppState {
  tasks: Task[];
  viewMode: ViewMode;
  colorScheme: ColorScheme;
  showCompleted: boolean;
  selectedPriority?: PriorityLevel;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: CategoryType;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  progress: number;
  subtasks: Subtask[];
  tags: string[];
  sharedWith?: string[];
}

export type ThemeMode = 'light' | 'dark';
export type FilterType = 'all' | 'active' | 'completed';
export type CategoryType = 'personal' | 'work' | 'shopping' | 'other';
export type SortField = 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface TodoState {
  todos: Todo[];
  filter: FilterType;
  theme: ThemeMode;
  colorTheme: string;
  voiceEnabled: boolean;
  selectedVoice?: string;
  category: CategoryType | 'all';
  searchQuery: string;
  priorityFilter: 'all' | 'low' | 'medium' | 'high';
  sortField: SortField;
  sortOrder: SortOrder;
  selectedTags: string[];
  showStatistics: boolean;
}

export interface ShareableTodo {
  todos: Todo[];
  theme: string;
  colorTheme: string;
}

export interface TodoStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  tasksByCategory: {
    [key in CategoryType]: number;
  };
  tasksByDueDate: {
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
    dueLater: number;
  };
  averageCompletionTime: number;
  mostProductiveDay: string;
  mostUsedTags: string[];
} 