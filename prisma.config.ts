import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local so Prisma CLI picks up Supabase credentials
config({ path: resolve(process.cwd(), ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
