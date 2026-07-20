import prisma from "../src/lib/client";

// Popular venues from major music cities
const venues = [
  // Berlin
  { name: "Berghain", city: "Berlin", country: "Germany", lat: 52.5112, lng: 13.4430, address: "Am Wriezener Bhf, 10243 Berlin" },
  { name: "Watergate", city: "Berlin", country: "Germany", lat: 52.5031, lng: 13.4195, address: "Falckensteinstraße 49, 10997 Berlin" },
  { name: "Sisyphos", city: "Berlin", country: "Germany", lat: 52.5138, lng: 13.4548, address: "Hauptstraße 33, 10243 Berlin" },
  { name: "Kater Blau", city: "Berlin", country: "Germany", lat: 52.5138, lng: 13.4548, address: "Hauptstraße 33, 10243 Berlin" },
  { name: "About Blank", city: "Berlin", country: "Germany", lat: 52.5167, lng: 13.4542, address: "Markgrafendamm 24c, 10247 Berlin" },
  
  // London
  { name: "Fabric", city: "London", country: "United Kingdom", lat: 51.5255, lng: -0.0875, address: "77a Charterhouse Street, London EC1M 6HJ" },
  { name: "Ministry of Sound", city: "London", country: "United Kingdom", lat: 51.4989, lng: -0.0975, address: "103 Gaunt Street, London SE1 6DP" },
  { name: "Printworks", city: "London", country: "United Kingdom", lat: 51.4947, lng: -0.0645, address: "14 Rivington St, London EC2A 3L2" },
  { name: "E1 London", city: "London", country: "United Kingdom", lat: 51.5176, lng: -0.0662, address: "Unit 3, 35 Whitechapel Road, London E1 1BY" },
  
  // Stockholm
  { name: "Trädgården", city: "Stockholm", country: "Sweden", lat: 59.3163, lng: 18.0748, address: "Tullportsgatan 2, 116 37 Stockholm" },
  { name: "Berns", city: "Stockholm", country: "Sweden", lat: 59.3365, lng: 18.0748, address: "Näckströmsgatan 8, 111 47 Stockholm" },
  { name: "Slaktkyrkan", city: "Stockholm", country: "Sweden", lat: 59.3292, lng: 18.0655, address: "Kungsholmsgatan 49, 112 27 Stockholm" },
  { name: "Under Bron", city: "Stockholm", country: "Sweden", lat: 59.3163, lng: 18.0748, address: "Tullportsgatan 2, 116 37 Stockholm" },
  
  // Amsterdam
  { name: "De School", city: "Amsterdam", country: "Netherlands", lat: 52.3556, lng: 4.8745, address: "Jan van Galenstraat 6, 1061 EA Amsterdam" },
  { name: "Shelter", city: "Amsterdam", country: "Netherlands", lat: 52.3741, lng: 4.9394, address: "NDSM Plein 20, 1033 WB Amsterdam" },
  { name: "Melkweg", city: "Amsterdam", country: "Netherlands", lat: 52.3667, lng: 4.8833, address: "Lijnbaansgracht 234a, 1017 PH Amsterdam" },
  { name: "Paradiso", city: "Amsterdam", country: "Netherlands", lat: 52.3636, lng: 4.8819, address: "Weteringschans 6-8, 1017 SP Amsterdam" },
  
  // Paris
  { name: "Rex Club", city: "Paris", country: "France", lat: 48.8667, lng: 2.3433, address: "5 Bd Poissonnière, 75002 Paris" },
  { name: "Concrete", city: "Paris", country: "France", lat: 48.8733, lng: 2.3833, address: "110 Quai de Jemmapes, 75010 Paris" },
  { name: "Social Club", city: "Paris", country: "France", lat: 48.8667, lng: 2.3433, address: "142 Rue de Montmartre, 75002 Paris" },
  
  // Barcelona
  { name: "Razzmatazz", city: "Barcelona", country: "Spain", lat: 41.3978, lng: 2.1961, address: "Carrer de la Pamplona, 88, 08018 Barcelona" },
  { name: "Moog", city: "Barcelona", country: "Spain", lat: 41.3833, lng: 2.1733, address: "Carrer de la Arc del Teatre, 3, 08002 Barcelona" },
  { name: "Input", city: "Barcelona", country: "Spain", lat: 41.3833, lng: 2.1733, address: "Carrer de la Arc del Teatre, 3, 08002 Barcelona" },
  
  // New York
  { name: "Output", city: "New York", country: "United States", lat: 40.7217, lng: -73.9567, address: "74 Wythe Ave, Brooklyn, NY 11249" },
  { name: "TBA Brooklyn", city: "New York", country: "United States", lat: 40.7217, lng: -73.9567, address: "74 Wythe Ave, Brooklyn, NY 11249" },
  { name: "Elsewhere", city: "New York", country: "United States", lat: 40.7117, lng: -73.9417, address: "599 Johnson Ave, Brooklyn, NY 11237" },
  
  // Ibiza
  { name: "Amnesia", city: "Ibiza", country: "Spain", lat: 38.9167, lng: 1.4167, address: "Carrer de Ramón y Cajal, 07800 Ibiza" },
  { name: "DC-10", city: "Ibiza", country: "Spain", lat: 38.9167, lng: 1.4167, address: "Carrer de Salinas, 07800 Ibiza" },
  { name: "Ushuaïa", city: "Ibiza", country: "Spain", lat: 38.9167, lng: 1.4167, address: "Platja d'en Bossa, 07817 Ibiza" },
  { name: "Pacha", city: "Ibiza", country: "Spain", lat: 38.9167, lng: 1.4167, address: "Passeig Marítim, 07800 Ibiza" },
];

async function seedVenues() {
  console.log("🌱 Seeding venues...");

  for (const venue of venues) {
    // Find or create country
    let country = await prisma.country.findFirst({
      where: { name: { equals: venue.country, mode: "insensitive" } },
    });

    if (!country) {
      country = await prisma.country.create({
        data: { name: venue.country, code: venue.country.substring(0, 2).toUpperCase() },
      });
      console.log(`✅ Created country: ${venue.country}`);
    }

    // Find or create city
    let city = await prisma.city.findFirst({
      where: {
        name: { equals: venue.city, mode: "insensitive" },
        countryId: country.id,
      },
    });

    if (!city) {
      city = await prisma.city.create({
        data: { name: venue.city, countryId: country.id },
      });
      console.log(`✅ Created city: ${venue.city}`);
    }

    // Check if venue already exists
    const existing = await prisma.venue.findFirst({
      where: {
        name: { equals: venue.name, mode: "insensitive" },
        cityId: city.id,
      },
    });

    if (existing) {
      console.log(`⏭️  Venue already exists: ${venue.name}`);
      continue;
    }

    // Create venue
    await prisma.venue.create({
      data: {
        name: venue.name,
        address: venue.address,
        cityId: city.id,
        countryId: country.id,
        latitude: venue.lat,
        longitude: venue.lng,
        source: "manual",
        popularity: 10,
      },
    });

    console.log(`✅ Created venue: ${venue.name}`);
  }

  console.log("🎉 Venue seeding complete!");
}

seedVenues()
  .catch((e) => {
    console.error("❌ Error seeding venues:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
