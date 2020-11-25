import {
    Add,
    CalendarToday,
    Cancel,
    Edit,
    MedicalServices,
    Notes,
    Visibility
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cancelAppointment, fetchAppointments } from '../../store/slices/appointmentSlice';

const AppointmentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector((state) => state.appointments);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (selectedAppointment) {
      try {
        await dispatch(cancelAppointment(selectedAppointment.id)).unwrap();
        setCancelDialogOpen(false);
        setSelectedAppointment(null);
      } catch (error) {
        console.error('Cancel failed:', error);
      }
    }
  };

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
        return <Cancel />;
      default:
        return <CalendarToday />;
    }
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          My Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/appointments/book')}
        >
          Book New Appointment
        </Button>
      </Box>

      {appointments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Appointments Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You don't have any appointments scheduled. Book your first appointment to get started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/appointments/book')}
            >
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid item xs={12} md={6} lg={4} key={appointment.id}>
              <Card className="card-hover">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.specialization}
                      </Typography>
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

                  <Box mb={2}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Concerns:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.concerns}
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Symptoms:
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
                        Your Notes:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        bgcolor: 'grey.50', 
                        p: 1, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        {appointment.patient_notes}
                      </Typography>
                    </Box>
                  )}

                  {/* Diagnosis Display */}
                  {appointment.diagnosis && appointment.diagnosis !== 'Pending' && (
                    <Box mb={2}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Diagnosis:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.diagnosis}
                      </Typography>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box display="flex" gap={1} mt={2}>
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleCancelAppointment(appointment)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === 'completed' && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/appointments/${appointment.id}/view`)}
                      >
                        View Details
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your appointment with{' '}
            {selectedAppointment && `Dr. ${selectedAppointment.doctor_first_name} ${selectedAppointment.doctor_last_name}`}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Appointment</Button>
          <Button onClick={confirmCancel} color="error" variant="contained">
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentsPage;

