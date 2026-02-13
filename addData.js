require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Lot = require('./models/Lot');
const connectDB = require('./config/database');

const addData = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to database');

    // Check if admin user exists
    let admin = await User.findOne({ email: 'admin@sneakrz.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@sneakrz.com',
        password: 'AdminPass123!',
        role: 'admin'
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Check if Basketball category exists
    let category = await Category.findOne({ name: 'Basketball' });
    if (!category) {
      category = await Category.create({
        name: 'Basketball',
        description: 'Professional and casual basketball sneakers'
      });
      console.log('Basketball category created');
    } else {
      console.log('Basketball category already exists');
    }

    // Check if Nike Air Jordan lot already exists
    const existingLot = await Lot.findOne({ title: 'Nike Air Jordan 1 Retro High OG' });
    if (existingLot) {
      console.log('⚠️  Nike Air Jordan lot already exists');
      console.log('Lot ID:', existingLot._id);
    } else {
      // Create lot with future end date (7 days from now)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const lot = await Lot.create({
        title: 'Nike Air Jordan 1 Retro High OG',
        brand: 'Jordan',
        colorway: 'Black and Gold',
        size: 10,
        condition: 'VNDS',
        material: 'Leather',
        year: 2023,
        startBid: 199,
        currentBid: 199,
        description: 'Authentic Air Jordan 1 Retro High OG in pristine condition. Never worn, only tried on. Original box and receipt included.',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
        category: category._id,
        bidIncrement: 10,
        createdBy: admin._id,
        endDate: endDate
      });

      console.log('Nike Air Jordan lot created successfully!');
      console.log('Lot ID:', lot._id);
      console.log('URL: http://localhost:3000');
    }

    console.log('\nData addition complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

addData();
