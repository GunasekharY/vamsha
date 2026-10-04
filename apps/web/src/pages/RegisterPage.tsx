import { useState } from 'react';
import type { FormEvent } from 'react';
import { Box, Button, Container, Link as MuiLink, TextField, Typography, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth-api';
import { useAuthStore } from '../store/auth-store';

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await registerUser({ name, email, password });
      setSession(result);
      navigate('/families');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Create your account
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          helperText="At least 10 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={submitting} fullWidth>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
        <Typography variant="body2">
          Already have an account? <MuiLink component={Link} to="/login">Sign in</MuiLink>
        </Typography>
      </Box>
    </Container>
  );
}
