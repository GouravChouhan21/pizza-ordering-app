import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Edit,
  Visibility,
  LocalShipping,
  Restaurant,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_kitchen', label: 'In Kitchen' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 10);

      const response = await axios.get(`/api/admin/orders?${params}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusDialog(true);
  };

  const updateOrderStatus = async () => {
    try {
      await axios.put(`/api/admin/orders/${selectedOrder._id}/status`, {
        status: newStatus
      });
      
      setShowStatusDialog(false);
      fetchOrders(); // Refresh orders
    } catch (error) {
      setError('Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading orders...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Order Management
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
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
                        <Typography variant="caption" color="text.secondary" display="block">
                          {order.user.phone}
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
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewOrder(order)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleStatusChange(order)}
                        >
                          Update
                        </Button>
                      </Box>
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

      {/* Order Details Dialog */}
      <Dialog 
        open={showOrderDetails} 
        onClose={() => setShowOrderDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order #{selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Order Status
                  </Typography>
                  <Chip
                    label={selectedOrder.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(selectedOrder.status)}
                    size="large"
                  />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" color="primary.main">
                    ₹{selectedOrder.totalAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {selectedOrder.user.name}<br />
                <strong>Email:</strong> {selectedOrder.user.email}<br />
                <strong>Phone:</strong> {selectedOrder.user.phone}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <List>
                {selectedOrder.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={item.pizza.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Base: {item.customizations.base?.name || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              Sauce: {item.customizations.sauce?.name || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              Cheese: {item.customizations.cheese?.name || 'N/A'}
                            </Typography>
                            {item.customizations.veggies?.length > 0 && (
                              <Typography variant="body2">
                                Vegetables: {item.customizations.veggies.map(v => v.name).join(', ')}
                              </Typography>
                            )}
                            {item.customizations.meat?.length > 0 && (
                              <Typography variant="body2">
                                Meats: {item.customizations.meat.map(m => m.name).join(', ')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Typography variant="h6">
                        ₹{item.price}
                      </Typography>
                    </ListItem>
                    {index < selectedOrder.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {selectedOrder.deliveryAddress && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Delivery Address
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.deliveryAddress.street}<br />
                    {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}<br />
                    Phone: {selectedOrder.deliveryAddress.phone}
                  </Typography>
                </>
              )}

              {selectedOrder.estimatedDeliveryTime && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Estimated Delivery
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedOrder.estimatedDeliveryTime)}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOrderDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              label="New Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {statusOptions.slice(1).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>
            Cancel
          </Button>
          <Button onClick={updateOrderStatus} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrders;
