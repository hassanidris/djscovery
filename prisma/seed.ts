import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Country, City } from "country-state-city";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GENRES = [
  // ── House ──────────────────────────────────────────────
  "House",
  "Deep House",
  "Tech House",
  "Progressive House",
  "Afro House",
  // ── Techno ─────────────────────────────────────────────
  "Techno",
  "Melodic Techno",
  "Minimal Techno",
  // ── Trance ─────────────────────────────────────────────
  "Trance",
  "Progressive Trance",
  "Psytrance",
  // ── Drum & Bass / Jungle ───────────────────────────────
  "Drum & Bass",
  "Liquid DnB",
  "Jungle",
  // ── Bass / Future ──────────────────────────────────────
  "Dubstep",
  "Future Bass",
  "UK Garage",
  // ── Hard Dance ─────────────────────────────────────────
  "Hardstyle",
  "Hardcore",
  // ── Disco / Funk ───────────────────────────────────────
  "Disco",
  "Nu-Disco",
  // ── Urban / Hip-Hop ────────────────────────────────────
  "Hip-Hop",
  "R&B",
  "Afrobeats",
  "Dancehall",
  "Reggaeton",
  "Reggae",
  // ── Latin ──────────────────────────────────────────────
  "Latin Pop",
  // ── Afro & Global ──────────────────────────────────────
  "Amapiano",
  "Kizomba",
  "Gqom",
  // ── Middle Eastern & African ───────────────────────────
  "Arabic",
  "Khaleeji",
  "Eritrean",
  "Ethiopian",
  "Somali",
  // ── Rock / Alternative ─────────────────────────────────
  "Rock",
  "Alternative",
  // ── Cultural / Regional ────────────────────────────────
  "Bollywood",
  "Bhangra",
  "Scandinavian",
  // ── Other ──────────────────────────────────────────────
  "Pop",
  "Commercial",
  "Open Format",
  "Wedding",
  "Corporate Events",
  "Top 40",
  "Throwback",
  "80s",
  "90s",
  "2000s",
];

async function main() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const forceSeed = process.env.FORCE_SEED === "true";

  // Known production markers — add more if the prod project changes
  const PROD_MARKERS = ["unrqebwfdfumpjgvavbk"];
  const urlLooksProd = PROD_MARKERS.some((m) => databaseUrl.includes(m));
  const envIsProd = appEnv === "production";
  const isProd = envIsProd || urlLooksProd;

  if (isProd && !forceSeed) {
    console.error(`
❌  Seed blocked — production database detected

    Reason: ${
      envIsProd
        ? "NEXT_PUBLIC_APP_ENV=production"
        : "DATABASE_URL contains a known production marker"
    }

    This guard prevents accidental seeding of the production database.
    The seed script contains reference data only (genres, countries, cities).

    To seed production intentionally, run:
    FORCE_SEED=true npm run seed

    ⚠️  Never seed fake or demo content into production.
`);
    process.exit(1);
  }

  if (isProd && forceSeed) {
    console.warn(
      "⚠️  FORCE_SEED=true — seeding production with reference data only.",
    );
  }

  console.log(`🎵 Seeding ${GENRES.length} genres...`);
  await prisma.genre.createMany({
    data: GENRES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const countries = Country.getAllCountries();
  console.log(`🌍 Seeding ${countries.length} countries...`);

  await prisma.country.createMany({
    data: countries.map((c) => ({ name: c.name, code: c.isoCode })),
    skipDuplicates: true,
  });

  const dbCountries = await prisma.country.findMany({
    select: { id: true, code: true },
  });
  const countryMap = new Map(dbCountries.map((c) => [c.code, c.id]));

  let totalCities = 0;
  console.log("🏙️  Seeding cities (this may take a minute)...");

  for (const country of countries) {
    const cities = City.getCitiesOfCountry(country.isoCode) ?? [];
    if (cities.length === 0) continue;

    const countryId = countryMap.get(country.isoCode);
    if (!countryId) continue;

    await prisma.city.createMany({
      data: cities.map((city) => ({ name: city.name, countryId })),
      skipDuplicates: true,
    });

    totalCities += cities.length;
    process.stdout.write(
      `\r  Progress: ${totalCities.toLocaleString()} cities`,
    );
  }

  console.log(
    `\n✅ Done! ${countries.length} countries and ~${totalCities.toLocaleString()} cities seeded.`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
