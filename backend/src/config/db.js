const { PrismaClient } = require("@prisma/client");

// A single shared Prisma instance. Prevents exhausting the free-tier
// Postgres connection limit (Render/Supabase free tiers cap around 20 connections).
const prisma = new PrismaClient();

module.exports = prisma;
