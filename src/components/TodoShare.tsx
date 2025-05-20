import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  Email as EmailIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import type { Todo } from '../types/todo';

interface TodoShareProps {
  todos: Todo[];
  onShare: (emails: string[]) => void;
}

const TodoShare = ({ todos, onShare }: TodoShareProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');

  const handleOpen = () => {
    setOpen(true);
    // Generate shareable link
    const shareableData = {
      todos,
      timestamp: new Date().toISOString()
    };
    const shareableString = btoa(JSON.stringify(shareableData));
    setShareLink(`${window.location.origin}/share/${shareableString}`);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setEmails([]);
    setError('');
  };

  const handleAddEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (emails.includes(email)) {
      setError('This email has already been added');
      return;
    }
    setEmails([...emails, email]);
    setEmail('');
    setError('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  const handleShare = () => {
    onShare(emails);
    handleClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <>
      <Tooltip title="Share Tasks">
        <IconButton onClick={handleOpen}>
          <ShareIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Share Tasks</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Share via Email
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!error}
                  helperText={error}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                />
                <Button
                  variant="contained"
                  onClick={handleAddEmail}
                  startIcon={<EmailIcon />}
                >
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {emails.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => handleRemoveEmail(email)}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Share via Link
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={shareLink}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={handleCopyLink}>
                        <ContentCopyIcon />
                      </IconButton>
                    )
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Anyone with this link can view and import these tasks
              </Typography>
            </Box>

            <Alert severity="info">
              Sharing {todos.length} task{todos.length !== 1 ? 's' : ''}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleShare}
            variant="contained"
            disabled={emails.length === 0}
            startIcon={<ShareIcon />}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TodoShare; 