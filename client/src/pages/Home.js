import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import {
  Restaurant,
  Build,
  ShoppingCart,
  Speed,
  Security,
  Support
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const howRef = useRef(null);
  const [howVisible, setHowVisible] = useState(false);

  useEffect(() => {
    const el = howRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHowVisible(entry.isIntersecting),
      { root: null, threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const features = [
    {
      icon: <Build sx={{ fontSize: 40, color: 'primary.contrastText' }} />,
      title: 'Custom Pizza Builder',
      description: 'Create your perfect pizza with our interactive builder. Choose from various bases, sauces, cheeses, and toppings.'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'primary.contrastText' }} />,
      title: 'Fast Delivery',
      description: 'Get your pizza delivered hot and fresh in just 30 minutes. Track your order in real-time.'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.contrastText' }} />,
      title: 'Secure Payment',
      description: 'Safe and secure payment processing with Razorpay. Your payment information is always protected.'
    },
    {
      icon: <Support sx={{ fontSize: 40, color: 'primary.contrastText' }} />,
      title: '24/7 Support',
      description: 'Our customer support team is available round the clock to help you with any queries.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #b71c1c 0%, #ef6c00 50%, #fdd835 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Restaurant sx={{ fontSize: { xs: 56, md: 84 }, mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" sx={{ letterSpacing: 0.5 }}>
            Pizza App
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Build your perfect pizza with our custom pizza builder
          </Typography>
          {isAuthenticated ? (
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/pizza-builder"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100'
                }
              }}
            >
              Start Building Your Pizza
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100'
                  }
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/login"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Login
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Powerful Features
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to craft and track your perfect pizza
        </Typography>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  transition: 'transform 220ms ease, box-shadow 220ms ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 6
                  }
                }}
                elevation={3}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ background: 'linear-gradient(180deg, #fafafa 0%, #fff 100%)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg" ref={howRef}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%', transition: 'all 350ms ease', opacity: howVisible ? 1 : 0, transform: `translateY(${howVisible ? 0 : 16}px)` }}>
                <Typography variant="h4" color="primary.main" sx={{ mb: 2 }}>
                  1
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Choose Your Base
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select from our variety of pizza bases including thin crust, thick crust, and more.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%', transition: 'all 350ms ease 80ms', opacity: howVisible ? 1 : 0, transform: `translateY(${howVisible ? 0 : 18}px)` }}>
                <Typography variant="h4" color="primary.main" sx={{ mb: 2 }}>
                  2
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Customize Your Pizza
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add your favorite sauces, cheeses, vegetables, and meats to create the perfect pizza.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%', transition: 'all 350ms ease 160ms', opacity: howVisible ? 1 : 0, transform: `translateY(${howVisible ? 0 : 20}px)` }}>
                <Typography variant="h4" color="primary.main" sx={{ mb: 2 }}>
                  3
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Order & Enjoy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Place your order with secure payment and track it in real-time until delivery.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Ready to Order?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Join thousands of satisfied customers and start building your perfect pizza today!
        </Typography>
        {!isAuthenticated && (
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
            sx={{ px: 4, py: 1.5 }}
          >
            Create Account Now
          </Button>
        )}
      </Container>
    </Box>
  );
};

export default Home;
