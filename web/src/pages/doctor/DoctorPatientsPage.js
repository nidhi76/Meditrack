import { Email, People, Person, Phone } from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../../store/slices/patientSlice';

const DoctorPatientsPage = () => {
  const dispatch = useDispatch();
  const { patients, loading, error } = useSelector((state) => state.patients);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

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
      <Typography variant="h4" gutterBottom>
        My Patients
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage and view information about your patients.
      </Typography>

      {patients.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Patients Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don't have any patients yet. Patients will appear here once they book appointments with you.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {patients.map((patient) => (
            <Grid item xs={12} sm={6} md={4} key={patient.email}>
              <Card className="card-hover">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {patient.first_name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {patient.first_name} {patient.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Patient
                      </Typography>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <Email sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                      {patient.email}
                    </Typography>
                    {patient.phone && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <Phone sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {patient.phone}
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      label={patient.gender}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {patient.date_of_birth && (
                      <Chip
                        label={`Age: ${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Person />}
                    onClick={() => {
                      // Navigate to patient details or medical history
                      console.log('View patient details:', patient.email);
                    }}
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
  );
};

export default DoctorPatientsPage;

