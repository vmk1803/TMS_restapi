import "dotenv/config";
import mongoose from "mongoose";
import argon2 from "argon2";
import User from "./src/models/User";

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tms';
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
      firstName: "Dev",
      lastName: "Team",
      email: "devteam@gmail.com",
      mobileNumber: "1234567890",
      gender: "male",
      active: true,
      profilePic: "",
      password: hashedPassword
    };

    // Save to database
    const savedUser = await User.create(adminData);

    console.log("Admin user created successfully:", {
      id: savedUser._id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName
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
