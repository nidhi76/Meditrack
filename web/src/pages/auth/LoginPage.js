import { Login as LoginIcon, MedicalServices } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearError, loginUser } from '../../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      // Navigation will be handled by the App component based on user type
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.userType === 'doctor' ? '/doctor/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <MedicalServices sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom>
                Meditrack
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Sign in to your healthcare account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
              </Typography>
            </Divider>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/register?type=patient"
                >
                  Register as Patient
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/register?type=doctor"
                >
                  Register as Doctor
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;

