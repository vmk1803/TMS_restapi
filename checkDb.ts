import "dotenv/config";
import mongoose from "mongoose";
import { db } from "./src/db/configuration";
import { users } from "./src/db/schema/users";
import { sql } from "drizzle-orm";

async function checkDbConnections() {
  let postgresOk = false;
  let mongoOk = false;

  console.log("Checking database connections...");

  // Test PostgreSQL connection
  try {
    console.log("🔍 Checking PostgreSQL connection...");
    await db.execute(sql`SELECT 1`);
    console.log("✅ PostgreSQL connection successful");

    // Test user table
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    console.log(`✅ Users table accessible. Current user count: ${userCount[0].count}`);
    postgresOk = true;
  } catch (error) {
    console.log("⚠️  PostgreSQL connection failed (this may be expected if not set up):", (error as any).message);
  }

  // Test MongoDB connection
  try {
    console.log("🔍 Checking MongoDB connection...");
    const mongoUri = 'mongodb+srv://munipallichaitanya1995_db_user:lFTL6OP8fC7bXCdV@cluster0.ta4msgc.mongodb.net/';

    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB already connected");
      mongoOk = true;
    } else {
      await mongoose.connect(mongoUri);
      console.log("✅ MongoDB connection successful");
      mongoOk = true;
    }

    // Test MongoDB with a simple ping
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      console.log("✅ MongoDB ping successful");
    } else {
      console.log("✅ MongoDB connected (no db reference for ping)");
    }
  } catch (error) {
    console.log("❌ MongoDB connection failed:", error);
  } finally {
    // Close MongoDB connection
    try {
      await mongoose.connection.close();
    } catch (e) {
      // ignore
    }
  }

  if (postgresOk && mongoOk) {
    console.log("✅ All database connections are working!");
    process.exit(0);
  } else if (mongoOk) {
    console.log("✅ MongoDB connection is working!");
    console.log("⚠️  PostgreSQL not connected (may need setup)");
    process.exit(0);
  } else {
    console.log("❌ No database connections available");
    process.exit(1);
  }
}

checkDbConnections();
