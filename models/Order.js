const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pizza',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    customizations: {
      base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pizza'
      },
      sauce: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pizza'
      },
      cheese: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pizza'
      },
      veggies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pizza'
      }],
      meat: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pizza'
      }]
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_kitchen', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  estimatedDeliveryTime: Date,
  notes: String
}, {
  timestamps: true
});

// Generate order number before validation so 'required' passes
orderSchema.pre('validate', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `PZ${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
