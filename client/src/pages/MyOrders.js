import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ShoppingCart,
  LocalPizza,
  AccessTime,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { orderUpdates, clearOrderUpdates } = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/my-orders');
      setOrders(response.data);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <AccessTime />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.post(`/api/orders/cancel/${orderId}`);
      setShowOrderDetails(false);
      fetchOrders(); // Refresh orders
    } catch (error) {
      setError('Failed to cancel order');
      console.error('Error cancelling order:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your orders...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Orders
        </Typography>
        {orderUpdates.length > 0 && (
          <Button 
            variant="outlined" 
            onClick={clearOrderUpdates}
            color="primary"
          >
            Clear Updates ({orderUpdates.length})
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {orderUpdates.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have {orderUpdates.length} new order update{orderUpdates.length > 1 ? 's' : ''}!
        </Alert>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No orders yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start building your perfect pizza to see your orders here!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => handleOrderClick(order)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.orderNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {formatDate(order.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(order.status)}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h6" color="primary.main">
                        ₹{order.totalAmount}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocalPizza color="action" />
                    <Typography variant="body2">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  {order.estimatedDeliveryTime && (
                    <Typography variant="body2" color="text.secondary">
                      Estimated delivery: {formatDate(order.estimatedDeliveryTime)}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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
                    icon={getStatusIcon(selectedOrder.status)}
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

              {selectedOrder.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Special Instructions
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.notes}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedOrder && ['pending', 'confirmed'].includes(selectedOrder.status) && (
            <Button 
              onClick={() => handleCancelOrder(selectedOrder._id)}
              color="error"
            >
              Cancel Order
            </Button>
          )}
          <Button onClick={() => setShowOrderDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyOrders;
