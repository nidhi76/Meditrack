import {
    Add,
    Assignment,
    CalendarToday,
    MedicalServices,
    Person
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAppointments } from '../../store/slices/appointmentSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loading } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.appointment_date) >= new Date())
    .slice(0, 3);

  const recentAppointments = appointments
    .filter(apt => apt.status === 'completed')
    .slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's an overview of your healthcare activities.
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/appointments/book')}
                  fullWidth
                >
                  Book Appointment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  onClick={() => navigate('/appointments')}
                  fullWidth
                >
                  View Appointments
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/medical-history')}
                  fullWidth
                >
                  Medical History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Upcoming Appointments
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/appointments')}
                >
                  View All
                </Button>
              </Box>
              
              {upcomingAppointments.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No upcoming appointments
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/appointments/book')}
                    sx={{ mt: 2 }}
                  >
                    Book Appointment
                  </Button>
                </Box>
              ) : (
                <List>
                  {upcomingAppointments.map((appointment) => (
                    <ListItem key={appointment.id} divider>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(appointment.appointment_date), 'MMM do, yyyy')} at {appointment.start_time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.specialization}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              {recentAppointments.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <MedicalServices sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No recent appointments
                  </Typography>
                </Box>
              ) : (
                <List>
                  {recentAppointments.map((appointment) => (
                    <ListItem key={appointment.id} divider>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <MedicalServices />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`Appointment with Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(appointment.appointment_date), 'MMM do, yyyy')}
                            </Typography>
                            {appointment.diagnosis && (
                              <Typography variant="body2" color="text.secondary">
                                Diagnosis: {appointment.diagnosis}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Chip
                        label="Completed"
                        color="success"
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

