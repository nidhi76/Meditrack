import {
    Assignment,
    CalendarToday,
    MedicalServices,
    Notes,
    People,
    TrendingUp,
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
    Paper,
    Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAppointments } from '../../store/slices/appointmentSlice';
import { fetchPatients } from '../../store/slices/patientSlice';

const DoctorDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loading: appointmentsLoading } = useSelector((state) => state.appointments);
  const { patients, loading: patientsLoading } = useSelector((state) => state.patients);

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchPatients());
  }, [dispatch]);

  const todayAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && 
    new Date(apt.appointment_date).toDateString() === new Date().toDateString()
  );

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.appointment_date) > new Date())
    .slice(0, 5);

  const completedToday = appointments.filter(apt => 
    apt.status === 'completed' && 
    new Date(apt.appointment_date).toDateString() === new Date().toDateString()
  );

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
        Welcome, Dr. {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's your daily overview and patient management dashboard.
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <CalendarToday />
                </Avatar>
                <Box>
                  <Typography variant="h4">{todayAppointments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today's Appointments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <MedicalServices />
                </Avatar>
                <Box>
                  <Typography variant="h4">{completedToday.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4">{patients.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Patients
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4">{appointments.filter(apt => apt.status === 'scheduled').length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Appointments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Today's Appointments
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/doctor/appointments')}
                >
                  View All
                </Button>
              </Box>
              
              {todayAppointments.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No appointments scheduled for today
                  </Typography>
                </Box>
              ) : (
                <List>
                  {todayAppointments.map((appointment) => (
                    <ListItem key={appointment.id} divider>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {appointment.patient_first_name?.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${appointment.patient_first_name} ${appointment.patient_last_name}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.start_time} - {appointment.end_time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.concerns}
                            </Typography>
                            {/* Patient Notes Display - NEW FEATURE */}
                            {appointment.patient_notes && (
                              <Box display="flex" alignItems="center" mt={1}>
                                <Notes sx={{ fontSize: 16, mr: 1, color: 'info.main' }} />
                                <Typography variant="body2" color="info.main" sx={{ fontStyle: 'italic' }}>
                                  "{appointment.patient_notes}"
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <Box display="flex" flexDirection="column" alignItems="flex-end">
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/doctor/appointments/${appointment.id}/diagnose`)}
                        >
                          Diagnose
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

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
                  startIcon={<CalendarToday />}
                  onClick={() => navigate('/doctor/appointments')}
                  fullWidth
                >
                  View Appointments
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  onClick={() => navigate('/doctor/patients')}
                  fullWidth
                >
                  Manage Patients
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/doctor/profile')}
                  fullWidth
                >
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Patients */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Patients
              </Typography>
              
              {patients.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No patients yet
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {patients.slice(0, 6).map((patient) => (
                    <Grid item xs={12} sm={6} md={4} key={patient.email}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                          {patient.first_name?.charAt(0)}
                        </Avatar>
                        <Typography variant="subtitle1">
                          {patient.first_name} {patient.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.gender}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.phone}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DoctorDashboardPage;

