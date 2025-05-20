import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  TextField
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import type { Todo } from '../types/todo';

interface TodoExportImportProps {
  todos: Todo[];
  onImport: (todos: Todo[]) => void;
}

const TodoExportImport = ({ todos, onImport }: TodoExportImportProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [importData, setImportData] = useState('');
  const [error, setError] = useState('');

  const handleOpen = (mode: 'export' | 'import') => {
    setOpen(true);
    setMode(mode);
    setImportData('');
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setImportData('');
    setError('');
  };

  const handleExport = () => {
    const exportData = {
      todos,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      if (!data.todos || !Array.isArray(data.todos)) {
        throw new Error('Invalid import data format');
      }
      onImport(data.todos);
      handleClose();
    } catch (err) {
      setError('Invalid JSON format or data structure');
    }
  };

  const handleCopyExport = () => {
    const exportData = {
      todos,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(jsonString);
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Tooltip title="Export Tasks">
          <IconButton onClick={() => handleOpen('export')}>
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Import Tasks">
          <IconButton onClick={() => handleOpen('import')}>
            <FileUploadIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {mode === 'export' ? 'Export Tasks' : 'Import Tasks'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {mode === 'export' ? (
              <>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Export Format
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Your tasks will be exported as a JSON file containing all task data,
                    including categories, priorities, due dates, and progress.
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      onClick={handleExport}
                      startIcon={<FileDownloadIcon />}
                    >
                      Download JSON
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCopyExport}
                      startIcon={<ContentCopyIcon />}
                    >
                      Copy to Clipboard
                    </Button>
                  </Stack>
                </Box>
                <Alert severity="info">
                  Exporting {todos.length} task{todos.length !== 1 ? 's' : ''}
                </Alert>
              </>
            ) : (
              <>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Import Tasks
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Paste your JSON data below to import tasks. The data should be in the
                    same format as exported tasks.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    error={!!error}
                    helperText={error}
                    placeholder="Paste your JSON data here..."
                  />
                </Box>
                <Alert severity="warning">
                  Importing tasks will add them to your existing tasks. Duplicate tasks
                  will be created if the IDs are different.
                </Alert>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {mode === 'import' && (
            <Button
              onClick={handleImport}
              variant="contained"
              disabled={!importData.trim()}
              startIcon={<FileUploadIcon />}
            >
              Import
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TodoExportImport; 