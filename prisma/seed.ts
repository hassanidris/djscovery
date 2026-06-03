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
