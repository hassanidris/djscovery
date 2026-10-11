import "@testing-library/jest-dom/vitest";
import prisma from "@/lib/client";

export async function getTestLocation() {
  let country = await prisma.country.findFirst({
    where: { name: "United States" },
    select: { id: true },
  });
  if (!country) {
    country = await prisma.country.findFirst({ select: { id: true } });
    if (!country) throw new Error("No country found in database");
  }

  let city = await prisma.city.findFirst({
    where: { countryId: country.id },
    select: { id: true },
  });
  if (!city) {
    city = await prisma.city.findFirst({
      where: { countryId: country.id },
      select: { id: true },
    });
    if (!city) throw new Error("No city found for the selected country");
  }

  return { countryId: country.id, cityId: city.id };
}
