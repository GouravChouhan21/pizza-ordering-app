const cron = require('node-cron');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Pizza = require('../models/Pizza');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config({ path: './config.env' });

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for stock monitoring'))
.catch(err => console.log('MongoDB connection error:', err));

// Function to check and send low stock notifications
const checkLowStock = async () => {
  try {
    console.log('Checking for low stock items...');
    
    const lowStockItems = await Pizza.find({
      stock: { $lte: 20 },
      isAvailable: true
    });

    if (lowStockItems.length > 0) {
      console.log(`Found ${lowStockItems.length} low stock items`);
      
      // Group items by category
      const groupedItems = lowStockItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      // Create email content
      let emailContent = '<h2>Low Stock Alert - Pizza App</h2>';
      emailContent += '<p>The following items are running low on stock:</p>';
      
      Object.keys(groupedItems).forEach(category => {
        emailContent += `<h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;
        emailContent += '<ul>';
        groupedItems[category].forEach(item => {
          emailContent += `<li><strong>${item.name}</strong>: ${item.stock} remaining (Threshold: ${item.threshold})</li>`;
        });
        emailContent += '</ul>';
      });
      
      emailContent += '<p><strong>Please restock these items as soon as possible.</strong></p>';

      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `Low Stock Alert - ${lowStockItems.length} items need restocking`,
        html: emailContent
      };

      await transporter.sendMail(mailOptions);
      console.log('Low stock notification sent to admin');
    } else {
      console.log('No low stock items found');
    }
  } catch (error) {
    console.error('Error checking low stock:', error);
  }
};

// Schedule the job to run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running low stock check...');
  checkLowStock();
});

// Also run once on startup
checkLowStock();

console.log('Stock monitoring service started. Checking every hour for low stock items.');

module.exports = { checkLowStock };
