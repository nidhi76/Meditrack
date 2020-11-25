import { Assignment, Save } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMedicalHistory, updateMedicalHistory } from '../../store/slices/patientSlice';

const MedicalHistoryPage = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const { profile, loading, error } = useSelector((state) => state.patients);

  useEffect(() => {
    dispatch(fetchMedicalHistory());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateMedicalHistory(data)).unwrap();
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
        Medical History
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Keep your medical history up to date for better healthcare.
      </Typography>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Assignment sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">
              Your Medical Information
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Medical Conditions"
                  multiline
                  rows={4}
                  {...register('conditions')}
                  placeholder="List any current medical conditions, chronic illnesses, or ongoing health issues..."
                  helperText="Include conditions like diabetes, hypertension, asthma, etc."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Previous Surgeries"
                  multiline
                  rows={3}
                  {...register('surgeries')}
                  placeholder="List any surgeries you have had, including dates if possible..."
                  helperText="Include major surgeries, procedures, or hospitalizations."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Medications"
                  multiline
                  rows={3}
                  {...register('medications')}
                  placeholder="List all current medications, including dosages and frequency..."
                  helperText="Include prescription medications, over-the-counter drugs, and supplements."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Known Allergies"
                  multiline
                  rows={2}
                  {...register('allergies')}
                  placeholder="List any known allergies to medications, foods, or other substances..."
                  helperText="Include drug allergies, food allergies, and environmental allergies."
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    size="large"
                  >
                    Save Medical History
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MedicalHistoryPage;

