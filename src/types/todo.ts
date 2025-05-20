export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  emoji?: string;
  color?: string;
}

export type ThemeMode = 'light' | 'dark';
export type FilterType = 'all' | 'active' | 'completed';

export interface TodoState {
  todos: Todo[];
  filter: FilterType;
  theme: ThemeMode;
  colorTheme: string;
  voiceEnabled: boolean;
  selectedVoice?: string;
}

export interface ShareableTodo {
  todos: Todo[];
  theme: string;
  colorTheme: string;
} 