import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  People,
  Block,
  CheckCircle,
  Add,
  AdminPanelSettings
} from '@mui/icons-material';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/users?page=${page}&limit=10`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, isActive) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { isActive });
      setSuccess('User status updated successfully');
      fetchUsers();
    } catch (error) {
      setError('Failed to update user status');
      console.error('Error updating user status:', error);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await axios.post('/api/admin/create-admin', adminFormData);
      setSuccess('Admin created successfully');
      setShowCreateAdminDialog(false);
      setAdminFormData({ name: '', email: '', password: '', phone: '' });
      fetchUsers();
    } catch (error) {
      setError('Failed to create admin');
      console.error('Error creating admin:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading users...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateAdminDialog(true)}
        >
          Create Admin
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Email Verified</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="bold">
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Chip
                        icon={user.role === 'admin' ? <AdminPanelSettings /> : <People />}
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.isEmailVerified ? <CheckCircle /> : <Block />}
                        label={user.isEmailVerified ? 'Verified' : 'Not Verified'}
                        color={user.isEmailVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant={user.isActive ? 'outlined' : 'contained'}
                        color={user.isActive ? 'error' : 'success'}
                        onClick={() => handleUserStatusChange(user._id, !user.isActive)}
                        disabled={user.role === 'admin'}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Typography sx={{ mx: 2, alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </Typography>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateAdminDialog} onClose={() => setShowCreateAdminDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={adminFormData.name}
                onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={adminFormData.email}
                onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={adminFormData.phone}
                onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={adminFormData.password}
                onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateAdminDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAdmin} variant="contained">Create Admin</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;
