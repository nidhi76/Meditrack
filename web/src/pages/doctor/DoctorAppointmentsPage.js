import {
    Assignment,
    CalendarToday,
    MedicalServices,
    Notes,
    Phone
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAppointments } from '../../store/slices/appointmentSlice';

const DoctorAppointmentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <CalendarToday />;
      case 'completed':
        return <MedicalServices />;
      case 'cancelled':
        return <Assignment />;
      default:
        return <CalendarToday />;
    }
  };

  const handleDiagnose = (appointmentId) => {
    navigate(`/doctor/appointments/${appointmentId}/diagnose`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const scheduledAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Appointments
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your patient appointments and provide diagnoses.
      </Typography>

      {/* Scheduled Appointments */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Scheduled Appointments ({scheduledAppointments.length})
        </Typography>
        
        {scheduledAppointments.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Scheduled Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any scheduled appointments at the moment.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {scheduledAppointments.map((appointment) => (
              <Grid item xs={12} md={6} lg={4} key={appointment.id}>
                <Card className="card-hover">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {appointment.patient_first_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {appointment.patient_first_name} {appointment.patient_last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Patient
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatusIcon(appointment.status)}
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {format(new Date(appointment.appointment_date), 'EEEE, MMMM do, yyyy')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.start_time} - {appointment.end_time}
                      </Typography>
                    </Box>

                    {appointment.phone && (
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          <Phone sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                          {appointment.phone}
                        </Typography>
                      </Box>
                    )}

                    <Box mb={2}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Patient Concerns:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.concerns}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Current Symptoms:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.symptoms}
                      </Typography>
                    </Box>

                    {/* Patient Notes Display - NEW FEATURE */}
                    {appointment.patient_notes && (
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          <Notes sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                          Patient Notes:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          bgcolor: 'info.light', 
                          p: 1.5, 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'info.main',
                          fontStyle: 'italic'
                        }}>
                          "{appointment.patient_notes}"
                        </Typography>
                      </Box>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<MedicalServices />}
                      onClick={() => handleDiagnose(appointment.id)}
                      sx={{ mt: 2 }}
                    >
                      Provide Diagnosis
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Completed Appointments */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Recent Completed Appointments ({completedAppointments.length})
        </Typography>
        
        {completedAppointments.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <MedicalServices sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Completed Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed appointments will appear here.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {completedAppointments.slice(0, 6).map((appointment) => (
              <Grid item xs={12} md={6} lg={4} key={appointment.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                          {appointment.patient_first_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {appointment.patient_first_name} {appointment.patient_last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Completed
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatusIcon(appointment.status)}
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {format(new Date(appointment.appointment_date), 'MMM do, yyyy')}
                      </Typography>
                    </Box>

                    {appointment.diagnosis && (
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Diagnosis:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.diagnosis}
                        </Typography>
                      </Box>
                    )}

                    {appointment.prescription && (
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Prescription:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.prescription}
                        </Typography>
                      </Box>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Assignment />}
                      onClick={() => handleDiagnose(appointment.id)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default DoctorAppointmentsPage;

