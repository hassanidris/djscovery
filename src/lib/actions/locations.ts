"use server";

import prisma from "@/lib/client";

export async function getCountries() {
  return prisma.country.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getCitiesForCountry(countryId: number) {
  return prisma.city.findMany({
    where: { countryId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
