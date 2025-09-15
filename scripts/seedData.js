const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Pizza = require('../models/Pizza');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => console.log('MongoDB connection error:', err));

const seedData = async () => {
  try {
    // Clear existing data
    await Pizza.deleteMany({});
    console.log('Cleared existing pizza data');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@pizzaapp.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@pizzaapp.com',
        password: 'admin123',
        phone: '9876543210',
        role: 'admin',
        isEmailVerified: true
      });
      await admin.save();
      console.log('Admin user created');
    }

    // Pizza bases
    const bases = [
      {
        name: 'Thin Crust',
        description: 'Crispy thin crust base',
        basePrice: 150,
        category: 'base',
        stock: 50,
        threshold: 10
      },
      {
        name: 'Thick Crust',
        description: 'Soft and fluffy thick crust',
        basePrice: 180,
        category: 'base',
        stock: 50,
        threshold: 10
      },
      {
        name: 'Cheese Burst',
        description: 'Crust filled with melted cheese',
        basePrice: 220,
        category: 'base',
        stock: 50,
        threshold: 10
      },
      {
        name: 'Whole Wheat',
        description: 'Healthy whole wheat base',
        basePrice: 160,
        category: 'base',
        stock: 50,
        threshold: 10
      },
      {
        name: 'Gluten Free',
        description: 'Gluten-free base for special dietary needs',
        basePrice: 200,
        category: 'base',
        stock: 50,
        threshold: 10
      }
    ];

    // Sauces
    const sauces = [
      {
        name: 'Tomato Sauce',
        description: 'Classic tomato sauce',
        basePrice: 20,
        category: 'sauce',
        stock: 100,
        threshold: 20
      },
      {
        name: 'BBQ Sauce',
        description: 'Smoky BBQ sauce',
        basePrice: 25,
        category: 'sauce',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Alfredo Sauce',
        description: 'Creamy alfredo sauce',
        basePrice: 30,
        category: 'sauce',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Pesto Sauce',
        description: 'Fresh basil pesto',
        basePrice: 35,
        category: 'sauce',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Spicy Sauce',
        description: 'Hot and spicy sauce',
        basePrice: 25,
        category: 'sauce',
        stock: 100,
        threshold: 20
      }
    ];

    // Cheeses
    const cheeses = [
      {
        name: 'Mozzarella',
        description: 'Classic mozzarella cheese',
        basePrice: 40,
        category: 'cheese',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Cheddar',
        description: 'Sharp cheddar cheese',
        basePrice: 45,
        category: 'cheese',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Parmesan',
        description: 'Aged parmesan cheese',
        basePrice: 50,
        category: 'cheese',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Goat Cheese',
        description: 'Creamy goat cheese',
        basePrice: 55,
        category: 'cheese',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Vegan Cheese',
        description: 'Plant-based vegan cheese',
        basePrice: 60,
        category: 'cheese',
        stock: 100,
        threshold: 20
      }
    ];

    // Vegetables
    const veggies = [
      {
        name: 'Bell Peppers',
        description: 'Fresh bell peppers',
        basePrice: 30,
        category: 'veggie',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Onions',
        description: 'Sliced onions',
        basePrice: 20,
        category: 'veggie',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Mushrooms',
        description: 'Fresh mushrooms',
        basePrice: 35,
        category: 'veggie',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Olives',
        description: 'Black olives',
        basePrice: 40,
        category: 'veggie',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Tomatoes',
        description: 'Fresh tomatoes',
        basePrice: 25,
        category: 'veggie',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Spinach',
        description: 'Fresh spinach leaves',
        basePrice: 30,
        category: 'veggie',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Jalapeños',
        description: 'Spicy jalapeños',
        basePrice: 35,
        category: 'veggie',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Corn',
        description: 'Sweet corn kernels',
        basePrice: 25,
        category: 'veggie',
        stock: 100,
        threshold: 20
      }
    ];

    // Meats
    const meats = [
      {
        name: 'Pepperoni',
        description: 'Classic pepperoni',
        basePrice: 60,
        category: 'meat',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Chicken',
        description: 'Grilled chicken',
        basePrice: 70,
        category: 'meat',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Bacon',
        description: 'Crispy bacon',
        basePrice: 65,
        category: 'meat',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Sausage',
        description: 'Italian sausage',
        basePrice: 55,
        category: 'meat',
        stock: 100,
        threshold: 20
      },
      {
        name: 'Ham',
        description: 'Sliced ham',
        basePrice: 50,
        category: 'meat',
        stock: 100,
        threshold: 20
      }
    ];

    // Insert all data
    const allItems = [...bases, ...sauces, ...cheeses, ...veggies, ...meats];
    await Pizza.insertMany(allItems);

    console.log('Database seeded successfully!');
    console.log(`Created ${bases.length} bases, ${sauces.length} sauces, ${cheeses.length} cheeses, ${veggies.length} veggies, and ${meats.length} meats`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
