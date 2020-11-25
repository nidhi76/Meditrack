import { MedicalServices, Notes, Save } from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAppointment } from '../../store/slices/appointmentSlice';
import { addDiagnosis } from '../../store/slices/doctorSlice';

const DiagnosePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const { currentAppointment, loading: appointmentLoading } = useSelector((state) => state.appointments);
  const { loading: diagnosisLoading } = useSelector((state) => state.doctors);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchAppointment(id));
    }
  }, [dispatch, id]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(addDiagnosis({ appointmentId: id, diagnosisData: data })).unwrap();
      navigate('/doctor/appointments');
    } catch (error) {
      console.error('Diagnosis failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (appointmentLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!currentAppointment) {
    return (
      <Alert severity="error">
        Appointment not found.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Diagnosis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Provide diagnosis and treatment for the patient appointment.
      </Typography>

      <Grid container spacing={3}>
        {/* Patient Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {currentAppointment.patient_first_name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {currentAppointment.patient_first_name} {currentAppointment.patient_last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patient
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Appointment Details
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Date: {new Date(currentAppointment.appointment_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Time: {currentAppointment.start_time} - {currentAppointment.end_time}
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Patient Concerns
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentAppointment.concerns}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Current Symptoms
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentAppointment.symptoms}
              </Typography>

              {/* Patient Notes Display - NEW FEATURE */}
              {currentAppointment.patient_notes && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    <Notes sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    Patient Notes
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main' }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{currentAppointment.patient_notes}"
                    </Typography>
                  </Paper>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Diagnosis Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <MedicalServices sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Medical Assessment
                </Typography>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Diagnosis"
                      multiline
                      rows={4}
                      {...register('diagnosis', {
                        required: 'Diagnosis is required',
                        minLength: {
                          value: 10,
                          message: 'Please provide a detailed diagnosis'
                        }
                      })}
                      error={!!errors.diagnosis}
                      helperText={errors.diagnosis?.message}
                      placeholder="Provide a detailed diagnosis based on the patient's symptoms and examination..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Prescription"
                      multiline
                      rows={4}
                      {...register('prescription', {
                        required: 'Prescription is required',
                        minLength: {
                          value: 10,
                          message: 'Please provide detailed prescription information'
                        }
                      })}
                      error={!!errors.prescription}
                      helperText={errors.prescription?.message}
                      placeholder="List medications, dosages, frequency, and any special instructions..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      multiline
                      rows={3}
                      {...register('doctorNotes')}
                      placeholder="Any additional notes, follow-up instructions, or recommendations..."
                      helperText="Optional: Additional notes for the patient or future reference"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" gap={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/doctor/appointments')}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Complete Diagnosis'}
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

export default DiagnosePage;

