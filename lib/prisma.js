// lib/prisma.js
import { PrismaClient } from "@prisma/client";

// Use a more explicit singleton pattern
const globalForPrisma = globalThis;

const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Log the db object to verify initialization
console.log("Prisma Client initialized:", db);
console.log("db.Assessment available:", !!db.Assessment);

export { db };