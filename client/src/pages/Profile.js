import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, TextField, Grid, Button, Alert, Box } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const payload = {
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode
        }
      };
      const res = await axios.put('/api/auth/me', payload);
      setUser(res.data.user);
      setSuccess('Profile saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>My Profile</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Delivery Address</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Street" name="street" value={form.street} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="City" name="city" value={form.city} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="State" name="state" value={form.state} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="ZIP" name="zipCode" value={form.zipCode} onChange={handleChange} />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="contained" onClick={saveProfile} disabled={loading}>
            Save
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;

