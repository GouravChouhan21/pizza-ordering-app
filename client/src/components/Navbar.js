import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge
} from '@mui/material';
import {
  Restaurant,
  Dashboard,
  ShoppingCart,
  AdminPanelSettings,
  Person,
  Logout,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { orderUpdates } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'primary.main' }}>
      <Toolbar>
        <Restaurant sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          Pizza App
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAdmin ? (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/admin"
                  sx={{
                    backgroundColor: isActive('/admin') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  <AdminPanelSettings sx={{ mr: 1 }} />
                  Admin Dashboard
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/admin/orders"
                  sx={{
                    backgroundColor: isActive('/admin/orders') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  Orders
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/admin/inventory"
                  sx={{
                    backgroundColor: isActive('/admin/inventory') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  Inventory
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/admin/users"
                  sx={{
                    backgroundColor: isActive('/admin/users') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  Users
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/dashboard"
                  sx={{
                    backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  <Dashboard sx={{ mr: 1 }} />
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/pizza-builder"
                  sx={{
                    backgroundColor: isActive('/pizza-builder') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  Build Pizza
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/my-orders"
                  sx={{
                    backgroundColor: isActive('/my-orders') ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  My Orders
                </Button>
              </>
            )}

            <IconButton color="inherit">
              <Badge badgeContent={orderUpdates.length} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                <Person />
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <Person sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
