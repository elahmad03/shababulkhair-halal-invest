import { prisma } from "./config/prisma";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // 1. Explicitly attempt to connect
    await prisma.$connect();
    
    // 2. Run a simple raw query to be absolutely sure (notice the backticks)
    await prisma.$queryRaw`SELECT 1`;
    
    console.log("✅ Database connected successfully!");
    
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    process.exit(1);
  } finally {
    // 3. Always disconnect gracefully when the script finishes
    await prisma.$disconnect();
  }
}

testConnection();