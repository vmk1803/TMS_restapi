import "dotenv/config";
import mongoose from "mongoose";
import argon2 from "argon2";

// Define User schema for MongoDB
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  mname: String,
  phone_number: String,
  role: { type: String, required: true, default: 'user' },
  active: { type: Boolean, default: true },
  profile_pic: String,
  designation: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://vmk1803_db_user:gTg6FZZJZ7goV4g3@cluster0.7bn7o7g.mongodb.net/?appName=Cluster0';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "devteam@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      return;
    }

    // Hash the password
    const hashedPassword = await argon2.hash("1234567");

    // Admin user data
    const adminData = {
      email: "devteam@gmail.com",
      password: hashedPassword,
      fname: "Dev",
      lname: "Team",
      role: "admin",
      active: true
    };

    // Save to database
    const savedUser = await User.create(adminData);

    console.log("Admin user created successfully:", {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
createAdminUser();
