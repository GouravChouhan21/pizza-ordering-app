import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Warning,
  CheckCircle,
  Inventory
} from '@mui/icons-material';
import axios from 'axios';

const AdminInventory = () => {
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: '',
    stock: '',
    threshold: '',
    isAvailable: true
  });

  const categories = ['base', 'sauce', 'cheese', 'veggie', 'meat'];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory');
      setInventory(response.data);
    } catch (error) {
      setError('Failed to fetch inventory');
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      await axios.post('/api/inventory', formData);
      setSuccess('Item added successfully');
      setShowAddDialog(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      setError('Failed to add item');
      console.error('Error adding item:', error);
    }
  };

  const handleEditItem = async () => {
    try {
      await axios.put(`/api/inventory/${selectedItem._id}`, formData);
      setSuccess('Item updated successfully');
      setShowEditDialog(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      setError('Failed to update item');
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/inventory/${itemId}`);
        setSuccess('Item deleted successfully');
        fetchInventory();
      } catch (error) {
        setError('Failed to delete item');
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleUpdateStock = async () => {
    try {
      await axios.put(`/api/inventory/${selectedItem._id}/stock`, {
        stock: parseInt(formData.stock)
      });
      setSuccess('Stock updated successfully');
      setShowStockDialog(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      setError('Failed to update stock');
      console.error('Error updating stock:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      category: '',
      stock: '',
      threshold: '',
      isAvailable: true
    });
    setSelectedItem(null);
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      basePrice: item.basePrice,
      category: item.category,
      stock: item.stock,
      threshold: item.threshold,
      isAvailable: item.isAvailable
    });
    setShowEditDialog(true);
  };

  const openStockDialog = (item) => {
    setSelectedItem(item);
    setFormData({ ...formData, stock: item.stock });
    setShowStockDialog(true);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'base':
        return 'primary';
      case 'sauce':
        return 'secondary';
      case 'cheese':
        return 'warning';
      case 'veggie':
        return 'success';
      case 'meat':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStockColor = (stock, threshold) => {
    if (stock <= threshold) return 'error';
    if (stock <= threshold * 2) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading inventory...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Item
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

      {Object.keys(inventory).map((category) => (
        <Card key={category} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Inventory sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {category} ({inventory[category].length} items)
              </Typography>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Threshold</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory[category].map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {item.name}
                        </Typography>
                        <Chip
                          label={item.category}
                          color={getCategoryColor(item.category)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell>₹{item.basePrice}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.stock}
                          color={getStockColor(item.stock, item.threshold)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.threshold}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.isAvailable ? 'Available' : 'Unavailable'}
                          color={item.isAvailable ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openStockDialog(item)}
                          >
                            <Inventory />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteItem(item._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Threshold"
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">Add Item</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Threshold"
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditItem} variant="contained">Update Item</Button>
        </DialogActions>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog open={showStockDialog} onClose={() => setShowStockDialog(false)}>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Stock Amount"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStockDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStock} variant="contained">Update Stock</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminInventory;
