import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Stack,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
  Paper,
  Divider,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Collapse,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  Palette as PaletteIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Share as ShareIcon,
  Label as LabelIcon,
  AddTask as AddTaskIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { Task, PriorityLevel, ViewMode, CategoryType, SortField, SortOrder, Subtask, Tag } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

const priorityColors = {
  low: '#4ECDC4',
  medium: '#FFD166',
  high: '#FF6B6B'
};

const categories = {
  work: { label: 'Work', icon: '💼', color: '#4ECDC4' },
  personal: { label: 'Personal', icon: '👤', color: '#FFD166' },
  shopping: { label: 'Shopping', icon: '🛒', color: '#FF6B6B' },
  health: { label: 'Health', icon: '❤️', color: '#95E1D3' },
  other: { label: 'Other', icon: '📝', color: '#A8E6CF' }
};

const TaskBoard = () => {
  const { colorScheme, setColorScheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as PriorityLevel,
    category: 'other' as CategoryType,
    dueDate: null as Date | null
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
  const [taskMenuAnchorEl, setTaskMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const [shareError, setShareError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        isDone: false,
        priority: newTask.priority,
        category: newTask.category,
        dueDate: newTask.dueDate,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'other',
        dueDate: null
      });
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, isDone: !task.isDone, updatedAt: new Date() } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    setTaskMenuAnchorEl(null);
  };

  const handlePriorityChange = (id: string, priority: PriorityLevel) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, priority, updatedAt: new Date() } : task
    ));
    setTaskMenuAnchorEl(null);
  };

  const handleCategoryChange = (id: string, category: CategoryType) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, category, updatedAt: new Date() } : task
    ));
    setTaskMenuAnchorEl(null);
  };

  const handleDueDateChange = (id: string, dueDate: Date | null) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, dueDate, updatedAt: new Date() } : task
    ));
    setTaskMenuAnchorEl(null);
  };

  const handleTaskMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setTaskMenuAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleTaskMenuClose = () => {
    setTaskMenuAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesCompletion = showCompleted || !task.isDone;
      return matchesSearch && matchesCategory && matchesCompletion;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'priority':
          return multiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return multiplier * (a.dueDate.getTime() - b.dueDate.getTime());
        default:
          return multiplier * (a.createdAt.getTime() - b.createdAt.getTime());
      }
    });

  const priorityOrder = { low: 0, medium: 1, high: 2 };

  const handleAddSubtask = (taskId: string) => {
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, subtasks: [...(task.subtasks || []), newSubtask] }
        : task
    ));
  };

  const handleSubtaskChange = (taskId: string, subtaskId: string, text: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks?.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, text, updatedAt: new Date() }
                : subtask
            )
          }
        : task
    ));
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks?.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed, updatedAt: new Date() }
                : subtask
            )
          }
        : task
    ));
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks?.filter(subtask => subtask.id !== subtaskId)
          }
        : task
    ));
  };

  const handleAddTag = (taskId: string, tag: string) => {
    if (!tag.trim()) return;
    const newTag: Tag = {
      id: Date.now().toString(),
      name: tag.trim(),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, tags: [...(task.tags || []), newTag] }
        : task
    ));
  };

  const handleDeleteTag = (taskId: string, tagId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, tags: task.tags?.filter(tag => tag.id !== tagId) }
        : task
    ));
  };

  const handleShareTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const shareData = {
      task,
      sharedBy: 'user@example.com', // Replace with actual user email
      sharedAt: new Date()
    };

    const shareLink = `${window.location.origin}/share/${btoa(JSON.stringify(shareData))}`;
    setShareLink(shareLink);
    setShareDialogOpen(true);
  };

  const handleShareSubmit = () => {
    if (!shareEmails.length) {
      setShareError('Please add at least one email address');
      return;
    }

    // Here you would typically make an API call to share the task
    setSnackbarMessage('Task shared successfully!');
    setSnackbarOpen(true);
    setShareDialogOpen(false);
    setShareEmails([]);
    setShareEmail('');
  };

  const calculateProgress = (task: Task) => {
    if (!task.subtasks?.length) return 0;
    const completed = task.subtasks.filter(st => st.completed).length;
    return (completed / task.subtasks.length) * 100;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Task Board
          </Typography>
          <Tooltip title="Change theme">
            <IconButton 
              onClick={(e) => setThemeAnchorEl(e.currentTarget)}
              id="theme-menu-button"
              aria-controls={Boolean(themeAnchorEl) ? 'theme-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(themeAnchorEl)}
            >
              <PaletteIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Menu
          anchorEl={themeAnchorEl}
          open={Boolean(themeAnchorEl)}
          onClose={() => setThemeAnchorEl(null)}
          TransitionComponent={Fade}
          keepMounted
          disablePortal
          MenuListProps={{
            'aria-labelledby': 'theme-menu-button',
            role: 'menu'
          }}
        >
          <MenuItem 
            onClick={() => { setColorScheme('sunset'); setThemeAnchorEl(null); }}
            role="menuitem"
          >
            Sunset
          </MenuItem>
          <MenuItem 
            onClick={() => { setColorScheme('ocean'); setThemeAnchorEl(null); }}
            role="menuitem"
          >
            Ocean
          </MenuItem>
          <MenuItem 
            onClick={() => { setColorScheme('forest'); setThemeAnchorEl(null); }}
            role="menuitem"
          >
            Forest
          </MenuItem>
          <MenuItem 
            onClick={() => { setColorScheme('lavender'); setThemeAnchorEl(null); }}
            role="menuitem"
          >
            Lavender
          </MenuItem>
        </Menu>

        <Stack spacing={2} mb={3}>
          <TextField
            fullWidth
            label="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            variant="outlined"
            size="small"
          />
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as PriorityLevel })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newTask.category}
                label="Category"
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as CategoryType })}
              >
                {Object.entries(categories).map(([key, { label, icon }]) => (
                  <MenuItem key={key} value={key}>
                    {icon} {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={newTask.dueDate}
                onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            sx={{ minWidth: 120 }}
          >
            Add Task
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            size="small"
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
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value as CategoryType | 'all')}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {Object.entries(categories).map(([key, { label, icon }]) => (
                <MenuItem key={key} value={key}>
                  {icon} {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Chip
            label="All Tasks"
            onClick={() => setShowCompleted(true)}
            color={showCompleted ? 'primary' : 'default'}
          />
          <Chip
            label="Active Tasks"
            onClick={() => setShowCompleted(false)}
            color={!showCompleted ? 'primary' : 'default'}
          />
          <Tooltip title="Sort by Title">
            <Chip
              icon={<SortIcon />}
              label="Title"
              onClick={() => handleSortChange('title')}
              color={sortField === 'title' ? 'primary' : 'default'}
            />
          </Tooltip>
          <Tooltip title="Sort by Priority">
            <Chip
              icon={<SortIcon />}
              label="Priority"
              onClick={() => handleSortChange('priority')}
              color={sortField === 'priority' ? 'primary' : 'default'}
            />
          </Tooltip>
          <Tooltip title="Sort by Due Date">
            <Chip
              icon={<SortIcon />}
              label="Due Date"
              onClick={() => handleSortChange('dueDate')}
              color={sortField === 'dueDate' ? 'primary' : 'default'}
            />
          </Tooltip>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {filteredAndSortedTasks.map((task) => (
          <Card
            key={task.id}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton
                    onClick={() => handleToggleTask(task.id)}
                    color={task.isDone ? 'success' : 'default'}
                  >
                    {task.isDone ? <CheckCircleIcon /> : <CircleIcon />}
                  </IconButton>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration: task.isDone ? 'line-through' : 'none',
                        color: task.isDone ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      icon={<FlagIcon />}
                      label={task.priority}
                      size="small"
                      sx={{
                        bgcolor: priorityColors[task.priority],
                        color: 'white'
                      }}
                    />
                    <Chip
                      icon={<CategoryIcon />}
                      label={categories[task.category].label}
                      size="small"
                      sx={{
                        bgcolor: categories[task.category].color,
                        color: 'white'
                      }}
                    />
                    {task.dueDate && (
                      <Chip
                        icon={<EventIcon />}
                        label={task.dueDate.toLocaleDateString()}
                        size="small"
                        color={task.dueDate < new Date() ? 'error' : 'default'}
                      />
                    )}
                    <IconButton
                      size="small"
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    >
                      {expandedTaskId === task.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleTaskMenuOpen(e, task.id)}
                      id="task-menu-button"
                      aria-controls={Boolean(taskMenuAnchorEl) ? 'task-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={Boolean(taskMenuAnchorEl)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                {task.subtasks?.length > 0 && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(task)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(calculateProgress(task))}% Complete
                    </Typography>
                  </Box>
                )}

                <Collapse in={expandedTaskId === task.id}>
                  <Stack spacing={2}>
                    {task.tags && task.tags.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {task.tags.map(tag => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                            onDelete={() => handleDeleteTag(task.id, tag.id)}
                            sx={{ bgcolor: tag.color, color: 'white' }}
                          />
                        ))}
                      </Stack>
                    )}

                    {task.subtasks && (
                      <List dense>
                        {task.subtasks.map(subtask => (
                          <ListItem key={subtask.id}>
                            <ListItemIcon>
                              <IconButton
                                size="small"
                                onClick={() => handleSubtaskToggle(task.id, subtask.id)}
                              >
                                {subtask.completed ? <CheckCircleIcon /> : <CircleIcon />}
                              </IconButton>
                            </ListItemIcon>
                            <ListItemText>
                              <TextField
                                fullWidth
                                size="small"
                                value={subtask.text}
                                onChange={(e) => handleSubtaskChange(task.id, subtask.id, e.target.value)}
                                placeholder="Enter subtask..."
                              />
                            </ListItemText>
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}

                    <Stack direction="row" spacing={1}>
                      <Button
                        startIcon={<AddTaskIcon />}
                        onClick={() => handleAddSubtask(task.id)}
                        size="small"
                      >
                        Add Subtask
                      </Button>
                      <Button
                        startIcon={<LabelIcon />}
                        onClick={() => {
                          const tag = prompt('Enter tag name:');
                          if (tag) handleAddTag(task.id, tag);
                        }}
                        size="small"
                      >
                        Add Tag
                      </Button>
                      <Button
                        startIcon={<ShareIcon />}
                        onClick={() => handleShareTask(task.id)}
                        size="small"
                      >
                        Share
                      </Button>
                    </Stack>
                  </Stack>
                </Collapse>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Menu
        anchorEl={taskMenuAnchorEl}
        open={Boolean(taskMenuAnchorEl)}
        onClose={handleTaskMenuClose}
        TransitionComponent={Fade}
        keepMounted
        disablePortal
        MenuListProps={{
          'aria-labelledby': 'task-menu-button',
          role: 'menu'
        }}
      >
        <MenuItem 
          onClick={() => selectedTaskId && handlePriorityChange(selectedTaskId, 'low')}
          role="menuitem"
        >
          Low Priority
        </MenuItem>
        <MenuItem 
          onClick={() => selectedTaskId && handlePriorityChange(selectedTaskId, 'medium')}
          role="menuitem"
        >
          Medium Priority
        </MenuItem>
        <MenuItem 
          onClick={() => selectedTaskId && handlePriorityChange(selectedTaskId, 'high')}
          role="menuitem"
        >
          High Priority
        </MenuItem>
        <Divider />
        {Object.entries(categories).map(([key, { label, icon }]) => (
          <MenuItem
            key={key}
            onClick={() => selectedTaskId && handleCategoryChange(selectedTaskId, key as CategoryType)}
            role="menuitem"
          >
            {icon} {label}
          </MenuItem>
        ))}
        <Divider />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Set Due Date"
            value={selectedTaskId ? tasks.find(t => t.id === selectedTaskId)?.dueDate || null : null}
            onChange={(date) => selectedTaskId && handleDueDateChange(selectedTaskId, date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
        <Divider />
        <MenuItem 
          onClick={() => selectedTaskId && handleDeleteTask(selectedTaskId)}
          sx={{ color: 'error.main' }}
          role="menuitem"
        >
          Delete Task
        </MenuItem>
      </Menu>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && shareEmail) {
                  setShareEmails([...shareEmails, shareEmail]);
                  setShareEmail('');
                }
              }}
            />
            {shareEmails.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {shareEmails.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => setShareEmails(shareEmails.filter((_, i) => i !== index))}
                  />
                ))}
              </Stack>
            )}
            {shareLink && (
              <TextField
                label="Share Link"
                value={shareLink}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          setSnackbarMessage('Link copied to clipboard!');
                          setSnackbarOpen(true);
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            {shareError && (
              <Alert severity="error" onClose={() => setShareError('')}>
                {shareError}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShareSubmit} variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default TaskBoard; 