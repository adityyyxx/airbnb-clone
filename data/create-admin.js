const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const DB_PATH = "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";

async function createAdmin() {
  try {
    process.env.NODE_OPTIONS = '--tls-min-v1.0';
    await mongoose.connect(DB_PATH);
    console.log('Connected to MongoDB');

    const username = 'adityyxx'.toLowerCase();
    const email = 'at271220003@gmail.com'.toLowerCase();
    const password = 'aditya1711';

    // Check if user exists
    let user = await User.findOne({ username });
    
    if (user) {
      console.log('User already exists, updating role to admin and resetting password...');
      const hashedPassword = await bcrypt.hash(password, 12);
      user.role = 'admin';
      user.password = hashedPassword;
      user.email = email;
      await user.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const hashedPassword = await bcrypt.hash(password, 12);
      user = new User({
        username,
        email,
        password: hashedPassword,
        role: 'admin'
      });
      await user.save();
      console.log('Admin user created successfully.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdmin();
