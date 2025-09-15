import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  LocalPizza,
  Restaurant,
  ShoppingCart,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';

// Load Razorpay checkout script lazily
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-js')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PizzaBuilder = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  
  // Pizza components
  const [bases, setBases] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [cheeses, setCheeses] = useState([]);
  const [veggies, setVeggies] = useState([]);
  const [meats, setMeats] = useState([]);
  
  // Selected items
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  const [selectedMeats, setSelectedMeats] = useState([]);
  
  // Price calculation
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const steps = ['Choose Base', 'Select Sauce', 'Pick Cheese', 'Add Vegetables', 'Add Meats', 'Review & Order'];

  useEffect(() => {
    fetchPizzaComponents();
  }, []);

  useEffect(() => {
    if (selectedBase || selectedSauce || selectedCheese || selectedVeggies.length > 0 || selectedMeats.length > 0) {
      calculatePrice();
    }
  }, [selectedBase, selectedSauce, selectedCheese, selectedVeggies, selectedMeats]);

  const fetchPizzaComponents = async () => {
    try {
      setLoading(true);
      const [basesRes, saucesRes, cheesesRes, veggiesRes, meatsRes] = await Promise.all([
        axios.get('/api/pizza/bases'),
        axios.get('/api/pizza/sauces'),
        axios.get('/api/pizza/cheeses'),
        axios.get('/api/pizza/veggies'),
        axios.get('/api/pizza/meats')
      ]);

      setBases(basesRes.data);
      setSauces(saucesRes.data);
      setCheeses(cheesesRes.data);
      setVeggies(veggiesRes.data);
      setMeats(meatsRes.data);
    } catch (error) {
      setError('Failed to load pizza components');
      console.error('Error fetching pizza components:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    try {
      const response = await axios.post('/api/pizza/calculate-price', {
        base: selectedBase?._id,
        sauce: selectedSauce?._id,
        cheese: selectedCheese?._id,
        veggies: selectedVeggies.map(v => v._id),
        meats: selectedMeats.map(m => m._id)
      });

      setPriceBreakdown(response.data.breakdown);
      setTotalPrice(response.data.totalPrice);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedBase) {
      setError('Please select a pizza base');
      return;
    }
    if (activeStep === 1 && !selectedSauce) {
      setError('Please select a sauce');
      return;
    }
    if (activeStep === 2 && !selectedCheese) {
      setError('Please select a cheese');
      return;
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleVeggieToggle = (veggie) => {
    setSelectedVeggies(prev => 
      prev.find(v => v._id === veggie._id) 
        ? prev.filter(v => v._id !== veggie._id)
        : [...prev, veggie]
    );
  };

  const handleMeatToggle = (meat) => {
    setSelectedMeats(prev => 
      prev.find(m => m._id === meat._id) 
        ? prev.filter(m => m._id !== meat._id)
        : [...prev, meat]
    );
  };

  const handleOrder = () => {
    if (totalPrice === 0) {
      setError('Please select at least a base, sauce, and cheese');
      return;
    }
    setShowOrderSummary(true);
  };

  const confirmOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const orderData = {
        items: [{
          pizza: selectedBase._id,
          quantity: 1,
          customizations: {
            base: selectedBase._id,
            sauce: selectedSauce._id,
            cheese: selectedCheese._id,
            veggies: selectedVeggies.map(v => v._id),
            meat: selectedMeats.map(m => m._id)
          }
        }]
      };

      const response = await axios.post('/api/orders/create-order', orderData);

      // If backend already confirmed (payments disabled), finish
      if (response.data?.order?.status === 'confirmed') {
        setSuccess('Order placed successfully!');
        setShowOrderSummary(false);
        setTimeout(() => navigate('/my-orders'), 1200);
        return;
      }

      // Payments enabled → open Razorpay checkout in test mode
      const cfg = await axios.get('/api/orders/config');
      if (!cfg.data.paymentsEnabled) {
        setSuccess('Order created. Awaiting payment.');
        setTimeout(() => navigate('/my-orders'), 1200);
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) {
        setError('Failed to load payment gateway');
        return;
      }

      const options = {
        key: cfg.data.keyId,
        amount: response.data.razorpayOrder.amount,
        currency: 'INR',
        name: 'Pizza App',
        description: response.data.order.orderNumber,
        order_id: response.data.razorpayOrder.id,
        handler: async function (rp) {
          try {
            await axios.post('/api/orders/verify-payment', {
              orderId: response.data.order._id,
              paymentId: rp.razorpay_payment_id,
              signature: rp.razorpay_signature
            });
            setSuccess('Payment successful! Order confirmed.');
            setShowOrderSummary(false);
            setTimeout(() => navigate('/my-orders'), 1000);
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        theme: { color: '#d32f2f' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      setError('Failed to place order');
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            {bases.map((base) => (
              <Grid item xs={12} sm={6} md={4} key={base._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedBase?._id === base._id ? 2 : 1,
                    borderColor: selectedBase?._id === base._id ? 'primary.main' : 'grey.300'
                  }}
                  onClick={() => setSelectedBase(base)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {base.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {base.description}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{base.basePrice}
                    </Typography>
                    <Chip 
                      label={`Stock: ${base.stock}`} 
                      color={base.stock > 0 ? 'success' : 'error'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            {sauces.map((sauce) => (
              <Grid item xs={12} sm={6} md={4} key={sauce._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedSauce?._id === sauce._id ? 2 : 1,
                    borderColor: selectedSauce?._id === sauce._id ? 'primary.main' : 'grey.300'
                  }}
                  onClick={() => setSelectedSauce(sauce)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {sauce.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {sauce.description}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{sauce.basePrice}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            {cheeses.map((cheese) => (
              <Grid item xs={12} sm={6} md={4} key={cheese._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedCheese?._id === cheese._id ? 2 : 1,
                    borderColor: selectedCheese?._id === cheese._id ? 'primary.main' : 'grey.300'
                  }}
                  onClick={() => setSelectedCheese(cheese)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {cheese.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {cheese.description}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{cheese.basePrice}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={2}>
            {veggies.map((veggie) => (
              <Grid item xs={12} sm={6} md={4} key={veggie._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedVeggies.find(v => v._id === veggie._id) ? 2 : 1,
                    borderColor: selectedVeggies.find(v => v._id === veggie._id) ? 'primary.main' : 'grey.300'
                  }}
                  onClick={() => handleVeggieToggle(veggie)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {veggie.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {veggie.description}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{veggie.basePrice}
                    </Typography>
                    {selectedVeggies.find(v => v._id === veggie._id) && (
                      <CheckCircle color="primary" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={2}>
            {meats.map((meat) => (
              <Grid item xs={12} sm={6} md={4} key={meat._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedMeats.find(m => m._id === meat._id) ? 2 : 1,
                    borderColor: selectedMeats.find(m => m._id === meat._id) ? 'primary.main' : 'grey.300'
                  }}
                  onClick={() => handleMeatToggle(meat)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {meat.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {meat.description}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      ₹{meat.basePrice}
                    </Typography>
                    {selectedMeats.find(m => m._id === meat._id) && (
                      <CheckCircle color="primary" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Base" 
                  secondary={selectedBase?.name}
                />
                <Typography variant="h6">₹{selectedBase?.basePrice}</Typography>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Sauce" 
                  secondary={selectedSauce?.name}
                />
                <Typography variant="h6">₹{selectedSauce?.basePrice}</Typography>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Cheese" 
                  secondary={selectedCheese?.name}
                />
                <Typography variant="h6">₹{selectedCheese?.basePrice}</Typography>
              </ListItem>
              {selectedVeggies.map((veggie) => (
                <ListItem key={veggie._id}>
                  <ListItemText 
                    primary="Vegetable" 
                    secondary={veggie.name}
                  />
                  <Typography variant="h6">₹{veggie.basePrice}</Typography>
                </ListItem>
              ))}
              {selectedMeats.map((meat) => (
                <ListItem key={meat._id}>
                  <ListItemText 
                    primary="Meat" 
                    secondary={meat.name}
                  />
                  <Typography variant="h6">₹{meat.basePrice}</Typography>
                </ListItem>
              ))}
              <Divider />
              <ListItem>
                <ListItemText primary="Total Amount" />
                <Typography variant="h5" color="primary.main">
                  ₹{totalPrice}
                </Typography>
              </ListItem>
            </List>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (loading && bases.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading pizza components...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Build Your Perfect Pizza
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          {renderStepContent(activeStep)}
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {totalPrice > 0 && (
              <Typography variant="h6" color="primary.main">
                Total: ₹{totalPrice}
              </Typography>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleOrder}
                disabled={loading}
                startIcon={<ShoppingCart />}
              >
                {loading ? <CircularProgress size={20} /> : 'Place Order'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </CardActions>
      </Card>

      {/* Order Confirmation Dialog */}
      <Dialog open={showOrderSummary} onClose={() => setShowOrderSummary(false)}>
        <DialogTitle>Confirm Your Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to place this order for ₹{totalPrice}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You may be redirected to test checkout depending on settings.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOrderSummary(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmOrder} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PizzaBuilder;
