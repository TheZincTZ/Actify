import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Chip,
  Stack,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Collapse,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
  PriorityHigh as PriorityHighIcon,
  Flag as FlagIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Sort as SortIcon,
  BarChart as BarChartIcon,
  Share as ShareIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import type { Todo as TodoType, FilterType, CategoryType, SortField, SortOrder } from '../types/todo';
import TodoStatistics from './TodoStatistics';
import TodoShare from './TodoShare';
import TodoExportImport from './TodoExportImport';

const categories = {
  personal: { color: '#4CAF50', icon: '👤' },
  work: { color: '#2196F3', icon: '💼' },
  shopping: { color: '#FF9800', icon: '🛒' },
  other: { color: '#9C27B0', icon: '📌' }
};

const priorities = {
  low: { color: '#4CAF50', icon: '⬇️' },
  medium: { color: '#FF9800', icon: '➡️' },
  high: { color: '#F44336', icon: '⬆️' }
};

const Todo = () => {
  const [todos, setTodos] = useState<TodoType[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('personal');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoType = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        description: description.trim(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: selectedCategory,
        priority: selectedPriority,
        dueDate: dueDate || undefined,
        progress: 0,
        subtasks: [],
        tags: []
      };
      setTodos([...todos, todo]);
      setNewTodo('');
      setDescription('');
      setDueDate(null);
    }
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: new Date() } : todo
    ));
  };

  const handleEditTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingId(id);
      setEditText(todo.text);
      setEditDescription(todo.description || '');
    }
  };

  const handleSaveEdit = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? {
        ...todo,
        text: editText,
        description: editDescription,
        updatedAt: new Date()
      } : todo
    ));
    setEditingId(null);
  };

  const handlePriorityChange = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, priority, updatedAt: new Date() } : todo
    ));
  };

  const handleDueDateChange = (id: string, date: Date | null) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, dueDate: date || undefined, updatedAt: new Date() } : todo
    ));
  };

  const handleAddSubtask = (todoId: string, text: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === todoId) {
        const subtask = {
          id: Date.now().toString(),
          text,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return {
          ...todo,
          subtasks: [...todo.subtasks, subtask],
          updatedAt: new Date()
        };
      }
      return todo;
    }));
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === todoId) {
        const subtasks = todo.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed, updatedAt: new Date() }
            : subtask
        );
        const progress = subtasks.length > 0
          ? (subtasks.filter(st => st.completed).length / subtasks.length) * 100
          : 0;
        return {
          ...todo,
          subtasks,
          progress,
          updatedAt: new Date()
        };
      }
      return todo;
    }));
  };

  const handleAddTag = (todoId: string, tag: string) => {
    if (!tag.trim()) return;
    setTodos(todos.map(todo => {
      if (todo.id === todoId && !todo.tags.includes(tag)) {
        return {
          ...todo,
          tags: [...todo.tags, tag],
          updatedAt: new Date()
        };
      }
      return todo;
    }));
  };

  const handleRemoveTag = (todoId: string, tag: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          tags: todo.tags.filter(t => t !== tag),
          updatedAt: new Date()
        };
      }
      return todo;
    }));
  };

  const handleShare = (emails: string[]) => {
    // In a real app, this would send emails or notifications
    console.log('Sharing with:', emails);
  };

  const handleImport = (importedTodos: TodoType[]) => {
    setTodos([...todos, ...importedTodos]);
  };

  const sortTodos = (todos: TodoType[]) => {
    return [...todos].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low']);
          break;
        case 'dueDate':
          comparison = (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filteredTodos = sortTodos(todos.filter(todo => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && !todo.completed) || 
      (filter === 'completed' && todo.completed);
    const matchesCategory = category === 'all' || todo.category === category;
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || todo.priority === priorityFilter;
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => todo.tags.includes(tag));
    return matchesFilter && matchesCategory && matchesSearch && matchesPriority && matchesTags;
  }));

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Task Manager
          </Typography>
          <Stack direction="row" spacing={1}>
            <TodoShare todos={todos} onShare={handleShare} />
            <TodoExportImport todos={todos} onImport={handleImport} />
            <Tooltip title="Show Statistics">
              <IconButton onClick={() => setShowStatistics(!showStatistics)}>
                <BarChartIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Collapse in={showStatistics}>
          <TodoStatistics todos={todos} />
        </Collapse>

        <Stack spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a new task"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={selectedPriority}
                label="Priority"
                onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high')}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{ textField: { sx: { minWidth: 150 } } }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              onClick={handleAddTodo}
              startIcon={<AddIcon />}
              sx={{ minWidth: 120 }}
            >
              Add
            </Button>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label="All"
              onClick={() => setFilter('all')}
              color={filter === 'all' ? 'primary' : 'default'}
            />
            <Chip
              label="Active"
              onClick={() => setFilter('active')}
              color={filter === 'active' ? 'primary' : 'default'}
            />
            <Chip
              label="Completed"
              onClick={() => setFilter('completed')}
              color={filter === 'completed' ? 'primary' : 'default'}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label="All Priorities"
              onClick={() => setPriorityFilter('all')}
              color={priorityFilter === 'all' ? 'primary' : 'default'}
            />
            {Object.entries(priorities).map(([key, { color, icon }]) => (
              <Chip
                key={key}
                label={`${icon} ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                onClick={() => setPriorityFilter(key as 'low' | 'medium' | 'high')}
                color={priorityFilter === key ? 'primary' : 'default'}
                sx={{ bgcolor: priorityFilter === key ? color : undefined }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip
              label="All Categories"
              onClick={() => setCategory('all')}
              color={category === 'all' ? 'primary' : 'default'}
            />
            {Object.entries(categories).map(([key, { color, icon }]) => (
              <Chip
                key={key}
                label={`${icon} ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                onClick={() => setCategory(key as CategoryType)}
                color={category === key ? 'primary' : 'default'}
                sx={{ bgcolor: category === key ? color : undefined }}
              />
            ))}
          </Stack>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortField}
                label="Sort By"
                onChange={(e) => setSortField(e.target.value as SortField)}
              >
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="createdAt">Created Date</MenuItem>
                <MenuItem value="updatedAt">Updated Date</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
          </Box>
        </Stack>
      </Paper>

      <List>
        {filteredTodos.map((todo) => (
          <Paper
            key={todo.id}
            elevation={1}
            sx={{
              mb: 1,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateX(4px)'
              }
            }}
          >
            <ListItem>
              {editingId === todo.id ? (
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(todo.id)}
                    autoFocus
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Task description (optional)"
                  />
                </Box>
              ) : (
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {todo.text}
                      </Typography>
                      {todo.category && (
                        <Chip
                          size="small"
                          label={`${categories[todo.category as CategoryType].icon} ${todo.category}`}
                          sx={{
                            bgcolor: categories[todo.category as CategoryType].color,
                            color: 'white'
                          }}
                        />
                      )}
                      {todo.priority && (
                        <Chip
                          size="small"
                          label={`${priorities[todo.priority].icon} ${todo.priority}`}
                          sx={{
                            bgcolor: priorities[todo.priority].color,
                            color: 'white'
                          }}
                        />
                      )}
                      {todo.dueDate && (
                        <Chip
                          size="small"
                          icon={<CalendarIcon />}
                          label={new Date(todo.dueDate).toLocaleDateString()}
                          color="default"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Stack spacing={1}>
                      {todo.description && (
                        <Typography variant="body2" color="text.secondary">
                          {todo.description}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(todo.createdAt).toLocaleString()}
                        </Typography>
                        {todo.updatedAt !== todo.createdAt && (
                          <Typography variant="caption" color="text.secondary">
                            Updated: {new Date(todo.updatedAt).toLocaleString()}
                          </Typography>
                        )}
                      </Stack>
                      {todo.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {todo.tags.map(tag => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              onDelete={() => handleRemoveTag(todo.id, tag)}
                            />
                          ))}
                        </Stack>
                      )}
                      {todo.subtasks.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={todo.progress}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {todo.subtasks.filter(st => st.completed).length} of {todo.subtasks.length} subtasks completed
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  }
                />
              )}
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  <Tooltip title={todo.completed ? "Mark as incomplete" : "Mark as complete"}>
                    <IconButton
                      edge="end"
                      onClick={() => handleToggleTodo(todo.id)}
                      color={todo.completed ? 'success' : 'default'}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit task">
                    <IconButton edge="end" onClick={() => handleEditTodo(todo.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete task">
                    <IconButton edge="end" onClick={() => handleDeleteTodo(todo.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={expandedTodo === todo.id ? "Collapse" : "Expand"}>
                    <IconButton
                      edge="end"
                      onClick={() => setExpandedTodo(expandedTodo === todo.id ? null : todo.id)}
                    >
                      {expandedTodo === todo.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>

            <Collapse in={expandedTodo === todo.id}>
              <Box sx={{ p: 2, pt: 0 }}>
                <Divider sx={{ mb: 2 }} />
                
                {/* Subtasks */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Subtasks
                  </Typography>
                  <List dense>
                    {todo.subtasks.map(subtask => (
                      <ListItem key={subtask.id}>
                        <ListItemText
                          primary={subtask.text}
                          sx={{
                            textDecoration: subtask.completed ? 'line-through' : 'none',
                            color: subtask.completed ? 'text.secondary' : 'text.primary'
                          }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleToggleSubtask(todo.id, subtask.id)}
                            color={subtask.completed ? 'success' : 'default'}
                          >
                            <CheckIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add subtask"
                      fullWidth
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          handleAddSubtask(todo.id, input.value);
                          input.value = '';
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Tags */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(todo.id, newTag);
                          setNewTag('');
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Additional Actions */}
                <Stack direction="row" spacing={1}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={todo.priority || 'medium'}
                      label="Priority"
                      onChange={(e) => handlePriorityChange(todo.id, e.target.value as 'low' | 'medium' | 'high')}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Due Date"
                      value={todo.dueDate || null}
                      onChange={(newValue) => handleDueDateChange(todo.id, newValue)}
                      slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
                    />
                  </LocalizationProvider>
                </Stack>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default Todo; 