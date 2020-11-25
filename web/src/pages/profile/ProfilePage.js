import { Person, Save } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorProfile, updateDoctorProfile } from '../../store/slices/doctorSlice';
import { fetchPatientProfile, updatePatientProfile } from '../../store/slices/patientSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile: patientProfile, loading: patientLoading } = useSelector((state) => state.patients);
  const { profile: doctorProfile, loading: doctorLoading } = useSelector((state) => state.doctors);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const loading = patientLoading || doctorLoading;
  const profile = user?.userType === 'patient' ? patientProfile : doctorProfile;

  useEffect(() => {
    if (user?.userType === 'patient') {
      dispatch(fetchPatientProfile());
    } else {
      dispatch(fetchDoctorProfile());
    }
  }, [dispatch, user]);

  const onSubmit = async (data) => {
    try {
      if (user?.userType === 'patient') {
        await dispatch(updatePatientProfile(data)).unwrap();
      } else {
        await dispatch(updateDoctorProfile(data)).unwrap();
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your personal information and account settings.
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.userType === 'patient' ? 'Patient' : 'Doctor'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              {user?.userType === 'doctor' && profile?.specialization && (
                <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                  {profile.specialization}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Person sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Personal Information
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      defaultValue={profile?.first_name || ''}
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
                      fullWidth
                      label="Last Name"
                      defaultValue={profile?.last_name || ''}
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

                  {user?.userType === 'patient' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          multiline
                          rows={2}
                          defaultValue={profile?.address || ''}
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
                          label="Phone Number"
                          defaultValue={profile?.phone || ''}
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
                          label="Date of Birth"
                          type="date"
                          defaultValue={profile?.date_of_birth || ''}
                          InputLabelProps={{ shrink: true }}
                          {...register('dateOfBirth')}
                        />
                      </Grid>
                    </>
                  )}

                  {user?.userType === 'doctor' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Specialization"
                          defaultValue={profile?.specialization || ''}
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="License Number"
                          defaultValue={profile?.license_number || ''}
                          disabled
                          helperText="License number cannot be changed"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          defaultValue={profile?.phone || ''}
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
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        size="large"
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;

