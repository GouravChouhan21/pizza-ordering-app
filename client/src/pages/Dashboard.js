import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Alert
} from '@mui/material';
import {
  Restaurant,
  Build,
  ShoppingCart,
  LocalPizza
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { orderUpdates, clearOrderUpdates } = useSocket();
  const [pizzaVarieties, setPizzaVarieties] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPizzaVarieties();
  }, []);

  const fetchPizzaVarieties = async () => {
    try {
      const response = await axios.get('/api/pizza/varieties');
      setPizzaVarieties(response.data);
    } catch (error) {
      console.error('Error fetching pizza varieties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCount = (category) => {
    return pizzaVarieties[category] ? pizzaVarieties[category].length : 0;
  };

  const getAvailableCount = (category) => {
    if (!pizzaVarieties[category]) return 0;
    return pizzaVarieties[category].filter(item => item.stock > 0).length;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Ready to build your perfect pizza? Explore our variety of ingredients and start creating!
        </Typography>
      </Box>

      {orderUpdates.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={clearOrderUpdates}>
              Dismiss
            </Button>
          }
        >
          You have {orderUpdates.length} new order update{orderUpdates.length > 1 ? 's' : ''}!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    to="/pizza-builder"
                    startIcon={<Build />}
                    sx={{ py: 2 }}
                  >
                    Build Pizza
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={Link}
                    to="/my-orders"
                    startIcon={<ShoppingCart />}
                    sx={{ py: 2 }}
                  >
                    My Orders
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Pizza Varieties Overview */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Available Pizza Ingredients
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalPizza sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Pizza Bases
              </Typography>
              <Typography variant="h4" color="primary.main" gutterBottom>
                {getCategoryCount('base')}
              </Typography>
              <Chip 
                label={`${getAvailableCount('base')} available`} 
                color={getAvailableCount('base') > 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={Link} 
                to="/pizza-builder"
                fullWidth
              >
                View Bases
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Sauces
              </Typography>
              <Typography variant="h4" color="secondary.main" gutterBottom>
                {getCategoryCount('sauce')}
              </Typography>
              <Chip 
                label={`${getAvailableCount('sauce')} available`} 
                color={getAvailableCount('sauce') > 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={Link} 
                to="/pizza-builder"
                fullWidth
              >
                View Sauces
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Cheeses
              </Typography>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {getCategoryCount('cheese')}
              </Typography>
              <Chip 
                label={`${getAvailableCount('cheese')} available`} 
                color={getAvailableCount('cheese') > 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={Link} 
                to="/pizza-builder"
                fullWidth
              >
                View Cheeses
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Vegetables
              </Typography>
              <Typography variant="h4" color="success.main" gutterBottom>
                {getCategoryCount('veggie')}
              </Typography>
              <Chip 
                label={`${getAvailableCount('veggie')} available`} 
                color={getAvailableCount('veggie') > 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={Link} 
                to="/pizza-builder"
                fullWidth
              >
                View Vegetables
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Orders Preview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check your recent orders and track their status in real-time.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                to="/my-orders"
                variant="outlined"
              >
                View All Orders
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
