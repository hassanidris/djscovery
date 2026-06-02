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
  "Electro House",
  "Future House",
  "Acid House",
  "Afro House",
  "Bass House",
  "Funky House",
  "Soulful House",
  "Tribal House",
  "Organic House",
  "Melodic House & Techno",
  // ── Techno ─────────────────────────────────────────────
  "Techno",
  "Melodic Techno",
  "Industrial Techno",
  "Minimal Techno",
  "Detroit Techno",
  // ── Trance ─────────────────────────────────────────────
  "Trance",
  "Progressive Trance",
  "Psytrance",
  "Hard Trance",
  // ── Drum & Bass / Jungle ───────────────────────────────
  "Drum & Bass",
  "Liquid DnB",
  "Neurofunk",
  "Jungle",
  // ── Bass / Future ──────────────────────────────────────
  "Dubstep",
  "Future Bass",
  "Trap",
  "Grime",
  "UK Garage",
  "Breakbeat",
  // ── Hard Dance ─────────────────────────────────────────
  "Hardstyle",
  "Hardcore",
  "Big Room",
  // ── Disco / Funk ───────────────────────────────────────
  "Disco",
  "Nu-Disco",
  "Funk",
  "Soul",
  // ── Electronica / Ambient ──────────────────────────────
  "EDM",
  "Electro",
  "Ambient",
  "Downtempo",
  "Lo-fi",
  "Chillout",
  "Lounge",
  "Indie Dance",
  // ── Urban / Hip-Hop ────────────────────────────────────
  "Hip-Hop",
  "R&B",
  "Afrobeats",
  "Dancehall",
  "Reggaeton",
  "Reggae",
  // ── Latin ──────────────────────────────────────────────
  "Latin",
  "Salsa",
  "Bachata",
  // ── Other ──────────────────────────────────────────────
  "Pop",
  "Commercial",
  "Open Format",
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
