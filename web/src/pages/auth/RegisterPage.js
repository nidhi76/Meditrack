import { MedicalServices, Person, PersonAdd } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clearError, registerDoctor, registerPatient } from '../../store/slices/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [userType, setUserType] = useState(searchParams.get('type') || 'patient');
  const [tabValue, setTabValue] = useState(userType === 'doctor' ? 1 : 0);

  const onSubmit = async (data) => {
    try {
      if (userType === 'patient') {
        await dispatch(registerPatient(data)).unwrap();
      } else {
        await dispatch(registerDoctor(data)).unwrap();
      }
      // Navigation will be handled by the App component
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setUserType(newValue === 0 ? 'patient' : 'doctor');
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.userType === 'doctor' ? '/doctor/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 600 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <MedicalServices sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom>
                Meditrack Registration
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Create your healthcare account
              </Typography>
            </Box>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{ mb: 3 }}
            >
              <Tab
                icon={<Person />}
                label="Patient"
                iconPosition="start"
              />
              <Tab
                icon={<PersonAdd />}
                label="Doctor"
                iconPosition="start"
              />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoComplete="given-name"
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      }
                    })}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    autoComplete="family-name"
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters'
                      }
                    })}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    autoComplete="email"
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
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
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      label="Gender"
                      {...register('gender', { required: 'Gender is required' })}
                      error={!!errors.gender}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Patient-specific fields */}
                {userType === 'patient' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="address"
                        label="Address"
                        autoComplete="address"
                        multiline
                        rows={2}
                        {...register('address', {
                          required: 'Address is required',
                          minLength: {
                            value: 5,
                            message: 'Please provide a complete address'
                          }
                        })}
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="phone"
                        label="Phone Number"
                        autoComplete="tel"
                        {...register('phone', {
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                          }
                        })}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="dateOfBirth"
                        label="Date of Birth"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        {...register('dateOfBirth')}
                      />
                    </Grid>
                  </>
                )}

                {/* Doctor-specific fields */}
                {userType === 'doctor' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="specialization"
                        label="Specialization"
                        {...register('specialization', {
                          required: 'Specialization is required',
                          minLength: {
                            value: 2,
                            message: 'Please provide a valid specialization'
                          }
                        })}
                        error={!!errors.specialization}
                        helperText={errors.specialization?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="licenseNumber"
                        label="License Number"
                        {...register('licenseNumber', {
                          required: 'License number is required',
                          minLength: {
                            value: 5,
                            message: 'License number must be at least 5 characters'
                          }
                        })}
                        error={!!errors.licenseNumber}
                        helperText={errors.licenseNumber?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="phone"
                        label="Phone Number"
                        autoComplete="tel"
                        {...register('phone', {
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                          }
                        })}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                  >
                    {loading ? 'Creating Account...' : `Register as ${userType === 'patient' ? 'Patient' : 'Doctor'}`}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/login"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RegisterPage;

