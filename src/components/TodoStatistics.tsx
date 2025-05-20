import { Box, Paper, Typography, Grid, LinearProgress, Chip, Stack } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { Todo, TodoStatistics, CategoryType } from '../types/todo';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface TodoStatisticsProps {
  todos: Todo[];
}

const calculateStatistics = (todos: Todo[]): TodoStatistics => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const stats: TodoStatistics = {
    totalTasks: todos.length,
    completedTasks: todos.filter(t => t.completed).length,
    pendingTasks: todos.filter(t => !t.completed).length,
    tasksByPriority: {
      low: todos.filter(t => t.priority === 'low').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      high: todos.filter(t => t.priority === 'high').length
    },
    tasksByCategory: {
      personal: todos.filter(t => t.category === 'personal').length,
      work: todos.filter(t => t.category === 'work').length,
      shopping: todos.filter(t => t.category === 'shopping').length,
      other: todos.filter(t => t.category === 'other').length
    },
    tasksByDueDate: {
      overdue: todos.filter(t => t.dueDate && new Date(t.dueDate) < today && !t.completed).length,
      dueToday: todos.filter(t => t.dueDate && new Date(t.dueDate).getTime() === today.getTime()).length,
      dueThisWeek: todos.filter(t => t.dueDate && new Date(t.dueDate) >= weekStart && new Date(t.dueDate) < today).length,
      dueLater: todos.filter(t => t.dueDate && new Date(t.dueDate) > today).length
    },
    averageCompletionTime: 0,
    mostProductiveDay: '',
    mostUsedTags: []
  };

  // Calculate average completion time
  const completedTasks = todos.filter(t => t.completed);
  if (completedTasks.length > 0) {
    const totalTime = completedTasks.reduce((acc, task) => {
      const completionTime = new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime();
      return acc + completionTime;
    }, 0);
    stats.averageCompletionTime = totalTime / completedTasks.length;
  }

  // Calculate most productive day
  const dayCounts = completedTasks.reduce((acc, task) => {
    const day = new Date(task.updatedAt).toLocaleDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const mostProductiveDay = Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

  stats.mostProductiveDay = mostProductiveDay;

  // Calculate most used tags
  const tagCounts = todos.reduce((acc, task) => {
    task.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as { [key: string]: number });

  stats.mostUsedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  return stats;
};

const TodoStatistics = ({ todos }: TodoStatisticsProps) => {
  const stats = calculateStatistics(todos);

  const priorityData = [
    { name: 'Low', value: stats.tasksByPriority.low },
    { name: 'Medium', value: stats.tasksByPriority.medium },
    { name: 'High', value: stats.tasksByPriority.high }
  ];

  const categoryData = Object.entries(stats.tasksByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Task Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Tasks
                </Typography>
                <Typography variant="h4">{stats.totalTasks}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(stats.completedTasks / stats.totalTasks) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Priority Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Due Date Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Due Date Status
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="error">
                  Overdue: {stats.tasksByDueDate.overdue}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  Due Today: {stats.tasksByDueDate.dueToday}
                </Typography>
                <Typography variant="body2" color="info.main">
                  Due This Week: {stats.tasksByDueDate.dueThisWeek}
                </Typography>
                <Typography variant="body2" color="success.main">
                  Due Later: {stats.tasksByDueDate.dueLater}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Additional Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Average Completion Time
                </Typography>
                <Typography variant="body1">
                  {formatTime(stats.averageCompletionTime)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Most Productive Day
                </Typography>
                <Typography variant="body1">
                  {stats.mostProductiveDay || 'No data'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Most Used Tags
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {stats.mostUsedTags.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TodoStatistics; 