// src/services/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 configuration အသစ်အရ database connection ကို adapter ဖြင့် ထည့်ပေးရပါသည်
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:Mb1862214@localhost:5432/family_bridge?schema=public',
  }),
});

export default prisma;