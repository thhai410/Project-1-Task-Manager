const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://thanhhai:Q4RZtuZ6ofIJW5CHL8oS@project1.hy3kqrw.mongodb.net/?appName=project1');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'member'], default: 'user' },
  address: { type: String, default: '' },
  info: { type: String, default: '' },
  created_date: { type: Date, default: Date.now },
  last_login: { type: Date }
});

const User = mongoose.model('user', userSchema);

const createAdminUser = async () => {
  try {
    // Delete existing admin if exists
    await User.deleteMany({ email: 'admin@taskflow.com' });
    console.log('Deleted existing admin user');

    // Hash password
    const hashedPassword = bcrypt.hashSync('admin123', bcrypt.genSaltSync(10));

    // Create admin user
    const adminUser = new User({
      name: 'Administrator',
      username: 'admin',
      email: 'admin@taskflow.com',
      password: hashedPassword,
      role: 'admin',
      address: 'System Admin',
      info: 'System Administrator'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@taskflow.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createAdminUser();
  await mongoose.connection.close();
  console.log('Script completed');
};

run();