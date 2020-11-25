import { CalendarToday, Notes, Person, Warning } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { bookAppointment, fetchAvailableSlots } from '../../store/slices/appointmentSlice';
import { fetchDoctors } from '../../store/slices/doctorSlice';

const BookAppointmentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  
  const { doctors, loading: doctorsLoading } = useSelector((state) => state.doctors);
  const { availableSlots, bookingLoading, bookingError } = useSelector((state) => state.appointments);
  
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientNotes, setPatientNotes] = useState('');

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      dispatch(fetchAvailableSlots({ doctorEmail: selectedDoctor, date: dateString }));
    }
  }, [selectedDoctor, selectedDate, dispatch]);

  const onSubmit = async (data) => {
    if (!selectedSlot) {
      return;
    }

    const appointmentData = {
      doctorId: selectedDoctor,
      appointmentDate: selectedDate.toISOString().split('T')[0],
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      concerns: data.concerns,
      symptoms: data.symptoms,
      patientNotes: patientNotes, // NEW FEATURE: Patient Notes
    };

    try {
      await dispatch(bookAppointment(appointmentData)).unwrap();
      navigate('/appointments');
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setSelectedTime(slot.startTime);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Book New Appointment
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Schedule an appointment with your preferred doctor. You can add notes about your concerns.
        </Typography>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Doctor Selection */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.doctor}>
                    <InputLabel>Select Doctor</InputLabel>
                    <Select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      label="Select Doctor"
                      disabled={doctorsLoading}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor.email} value={doctor.email}>
                          <Box>
                            <Typography variant="body1">
                              Dr. {doctor.first_name} {doctor.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {doctor.specialization}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.doctor && (
                      <FormHelperText>{errors.doctor.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Date Selection */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Appointment Date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    disabled={!selectedDoctor}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.appointmentDate}
                        helperText={errors.appointmentDate?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Available Time Slots */}
                {selectedDoctor && selectedDate && availableSlots.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Available Time Slots
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {availableSlots.map((slot, index) => (
                        <Chip
                          key={index}
                          label={slot.displayTime}
                          onClick={() => handleSlotSelect(slot)}
                          color={selectedSlot?.startTime === slot.startTime ? 'primary' : 'default'}
                          variant={selectedSlot?.startTime === slot.startTime ? 'filled' : 'outlined'}
                          icon={<CalendarToday />}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* No Available Slots Message */}
                {selectedDoctor && selectedDate && availableSlots.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" icon={<Warning />}>
                      No available time slots for the selected date. Please choose a different date.
                    </Alert>
                  </Grid>
                )}

                {/* Concerns */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Primary Concerns"
                    multiline
                    rows={3}
                    {...register('concerns', { 
                      required: 'Please describe your primary concerns',
                      minLength: {
                        value: 10,
                        message: 'Please provide more details about your concerns'
                      }
                    })}
                    error={!!errors.concerns}
                    helperText={errors.concerns?.message}
                    placeholder="Describe what you'd like to discuss with the doctor..."
                  />
                </Grid>

                {/* Symptoms */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Symptoms"
                    multiline
                    rows={3}
                    {...register('symptoms', { 
                      required: 'Please describe your current symptoms',
                      minLength: {
                        value: 5,
                        message: 'Please provide more details about your symptoms'
                      }
                    })}
                    error={!!errors.symptoms}
                    helperText={errors.symptoms?.message}
                    placeholder="List any symptoms you're currently experiencing..."
                  />
                </Grid>

                {/* Patient Notes - NEW FEATURE */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes (Optional)"
                    multiline
                    rows={4}
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    placeholder="Add any additional information, questions, or notes you'd like the doctor to know about..."
                    helperText="These notes will be visible to your doctor when reviewing your appointment"
                    InputProps={{
                      startAdornment: <Notes sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>

                {/* Error Display */}
                {bookingError && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      {bookingError}
                    </Alert>
                  </Grid>
                )}

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/appointments')}
                      disabled={bookingLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!selectedSlot || bookingLoading}
                      startIcon={bookingLoading ? <CircularProgress size={20} /> : <CalendarToday />}
                    >
                      {bookingLoading ? 'Booking...' : 'Book Appointment'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card sx={{ mt: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
              Important Information
            </Typography>
            <Typography variant="body2">
              • Please arrive 15 minutes before your scheduled appointment time<br/>
              • Bring a valid ID and insurance information<br/>
              • You can add notes about your concerns - these will help your doctor prepare for your visit<br/>
              • You can cancel or reschedule your appointment up to 24 hours in advance
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default BookAppointmentPage;

