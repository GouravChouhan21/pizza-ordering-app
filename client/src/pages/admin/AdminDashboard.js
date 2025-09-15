import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  Warning,
  CheckCircle,
  AccessTime,
  LocalShipping
} from '@mui/icons-material';
import axios from 'axios';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'in_kitchen':
        return 'primary';
      case 'out_for_delivery':
        return 'secondary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const { stats, recentOrders, lowStockItems } = dashboardData;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {stats.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    ₹{stats.totalRevenue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {stats.pendingOrders + stats.confirmedOrders + stats.inKitchenOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="error.main">
                    {lowStockItems.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Order Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Status Breakdown
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccessTime color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Pending" 
                    secondary={`${stats.pendingOrders} orders`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Confirmed" 
                    secondary={`${stats.confirmedOrders} orders`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Inventory color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="In Kitchen" 
                    secondary={`${stats.inKitchenOrders} orders`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalShipping color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Out for Delivery" 
                    secondary={`${stats.outForDeliveryOrders} orders`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Delivered" 
                    secondary={`${stats.deliveredOrders} orders`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Items
              </Typography>
              {lowStockItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  All items are well stocked!
                </Typography>
              ) : (
                <List>
                  {lowStockItems.map((item) => (
                    <ListItem key={item._id}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.category} - Stock: ${item.stock}`}
                      />
                      <Chip 
                        label="Low Stock" 
                        color="error" 
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {order.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>₹{order.totalAmount}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
