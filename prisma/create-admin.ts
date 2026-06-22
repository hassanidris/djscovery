import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// Load .env and .env.local relative to the project root (cwd)
const inheritedEnvKeys = new Set(Object.keys(process.env));
for (const file of [".env", ".env.local"]) {
  const filePath = resolve(process.cwd(), file);
  if (!existsSync(filePath)) continue;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (inheritedEnvKeys.has(key)) continue; // keep explicitly provided env vars
    process.env[key] = val; // allow .env.local to override .env
  }
}

/**
 * Admin Credential Creation Script
 * ---------------------------------
 * Creates a fully provisioned admin user in both Supabase Auth and the DB.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourStr0ng!Pass npm run create-admin
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL   — Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY  — Service role key (never exposed to the browser)
 *   - DATABASE_URL               — Postgres connection string
 *
 * Safety:
 *   - Credentials are NEVER hardcoded — always passed via environment variables.
 *   - The ADMIN role can only be granted through this script (not via sign-up).
 *   - Running again with the same email is idempotent — updates role if user exists.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local[0]}***@${domain}`;
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(`
❌  Missing credentials

    Provide them as environment variables:
    ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourStr0ng!Pass npm run create-admin

    Password requirements (OWASP):
      - At least 12 characters
      - At least one uppercase letter
      - At least one lowercase letter
      - At least one number
`);
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("❌  Password must be at least 12 characters.");
    process.exit(1);
  }
  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    console.error(
      "❌  Password must include at least one uppercase letter, one lowercase letter, and one number.",
    );
    process.exit(1);
  }

  const supabase = createAdminClient();

  console.log(`\n🔐 Creating admin user: ${maskEmail(email)}\n`);

  // ── Step 1: Check DB first to get the canonical user ID ───────────────────
  const username = email.split("@")[0].replace(/[^a-z0-9_]/gi, "") + "_admin";

  const existingDbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, username: true },
  });

  let dbUserId: string;
  let dbUsername: string;

  if (existingDbUser) {
    // DB user exists — use their ID as the canonical ID for auth too
    dbUserId = existingDbUser.id;
    dbUsername = existingDbUser.username;
    console.log(`  ℹ️  Existing DB user found (id: ${dbUserId})`);

    // Create or update the Supabase Auth user with the SAME ID as the DB user
    const { error: createError } = await supabase.auth.admin.createUser({
      id: dbUserId,
      email,
      password,
      email_confirm: true,
    });

    if (
      createError &&
      createError.message.includes("already been registered")
    ) {
      // Auth user already exists with this ID — just update the password
      const { error: pwError } = await supabase.auth.admin.updateUserById(
        dbUserId,
        { password, email_confirm: true },
      );
      if (pwError)
        throw new Error(`Failed to update password: ${pwError.message}`);
      console.log(`  ✅ Supabase Auth account password updated`);
    } else if (createError) {
      throw createError;
    } else {
      console.log(`  ✅ Supabase Auth account created (id: ${dbUserId})`);
    }

    await prisma.user.update({
      where: { id: dbUserId },
      data: { status: "ACTIVE" },
    });
  } else {
    // No DB user yet — create auth user first, then DB user with the resulting ID
    const { data: createData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError) throw createError;

    dbUserId = createData.user.id;
    console.log(`  ✅ Supabase Auth user created (id: ${dbUserId})`);

    const dbUser = await prisma.user.create({
      data: {
        id: dbUserId,
        email,
        username,
        status: "ACTIVE",
        onboardingComplete: true,
      },
    });
    dbUsername = dbUser.username;
  }

  console.log(`  ✅ DB User row ready (username: ${dbUsername})`);

  // ── Step 3: Grant ADMIN role ────────────────────────────────────────────────
  await prisma.userRole.upsert({
    where: { userId_role: { userId: dbUserId, role: "ADMIN" } },
    update: {},
    create: { userId: dbUserId, role: "ADMIN" },
  });

  console.log(`  ✅ ADMIN role granted\n`);
  console.log(`🎉 Admin ready! Sign in at /sign-in with:`);
  console.log(`   Email:    ${maskEmail(email)}`);
  console.log(`   Password: (the one you provided)\n`);
}

main()
  .catch((e) => {
    console.error("\n❌ Failed:", e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
