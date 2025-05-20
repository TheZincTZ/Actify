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
  CssBaseline,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Tooltip,
  Fab,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Check as CheckIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Share as ShareIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import type { Todo as TodoType, FilterType } from '../types/todo';
import { useTheme } from '../context/ThemeContext';

const Todo = () => {
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme();
  const [todos, setTodos] = useState<TodoType[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);
    if (voices.length > 0) {
      setSelectedVoice(voices[0].name);
    }
  }, []);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoType = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setTodos([...todos, todo]);
      setNewTodo('');
      if (voiceEnabled) {
        speakText(`Added new task: ${todo.text}`);
      }
    }
  };

  const handleDeleteTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    setTodos(todos.filter(todo => todo.id !== id));
    if (voiceEnabled && todo) {
      speakText(`Deleted task: ${todo.text}`);
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        if (voiceEnabled) {
          speakText(`${todo.completed ? 'Uncompleted' : 'Completed'} task: ${todo.text}`);
        }
        return { ...todo, completed: !todo.completed, updatedAt: new Date() };
      }
      return todo;
    }));
  };

  const handleEditTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingId(id);
      setEditText(todo.text);
    }
  };

  const handleSaveEdit = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editText, updatedAt: new Date() } : todo
    ));
    setEditingId(null);
    if (voiceEnabled) {
      speakText(`Updated task to: ${editText}`);
    }
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = availableVoices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    const shareableData = {
      todos,
      theme,
      colorTheme
    };
    const shareableString = btoa(JSON.stringify(shareableData));
    const shareableUrl = `${window.location.origin}?data=${shareableString}`;
    navigator.clipboard.writeText(shareableUrl);
    setSnackbar({ open: true, message: 'Shareable link copied to clipboard!' });
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <>
      <CssBaseline />
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Todo List
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Toggle theme">
              <IconButton onClick={toggleTheme}>
                {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Share tasks">
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a new todo"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <Button variant="contained" onClick={handleAddTodo}>
              Add
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                />
              }
              label="Voice"
            />
            {voiceEnabled && (
              <Select
                size="small"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                {availableVoices.map((voice) => (
                  <MenuItem key={voice.name} value={voice.name}>
                    {voice.name}
                  </MenuItem>
                ))}
              </Select>
            )}
            <Select
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </Box>
        </Paper>

        <List>
          {filteredTodos.map((todo) => (
            <ListItem
              key={todo.id}
              sx={{
                bgcolor: 'background.paper',
                mb: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {editingId === todo.id ? (
                <TextField
                  fullWidth
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(todo.id)}
                />
              ) : (
                <ListItemText
                  primary={todo.text}
                  secondary={new Date(todo.createdAt).toLocaleString()}
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.secondary' : 'text.primary'
                  }}
                />
              )}
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleToggleTodo(todo.id)}>
                  <CheckIcon color={todo.completed ? 'success' : 'action'} />
                </IconButton>
                <IconButton edge="end" onClick={() => handleEditTodo(todo.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteTodo(todo.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Todo; 