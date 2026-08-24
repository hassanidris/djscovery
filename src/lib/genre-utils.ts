// Shared genre utility functions — used by GenreSelector and form validation.
// Safe to import in both server and client code (pure functions, no DB access).

export function normalizeGenre(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findGenreByNormalized(
  name: string,
  availableGenres: string[],
): string | undefined {
  const norm = normalizeGenre(name);
  return availableGenres.find((g) => normalizeGenre(g) === norm);
}

/**
 * Find a similar genre name that might be a misspelling of the input.
 * Allows 1-2 character length differences for words longer than 3 chars
 * where one normalized form contains the other.
 */
export function findSimilarGenre(
  name: string,
  availableGenres: string[],
): string | undefined {
  const norm = normalizeGenre(name);
  for (const g of availableGenres) {
    const gNorm = normalizeGenre(g);
    if (gNorm.length > 3 && norm.length > 3) {
      if (Math.abs(gNorm.length - norm.length) <= 2) {
        if (gNorm.includes(norm) || norm.includes(gNorm)) return g;
      }
    }
  }
  return undefined;
}

/**
 * Filter available genres by user input.
 * Matches on normalized form (alphanumeric only) OR plain substring.
 * Excludes already-selected genres.
 */
export function filterGenres(
  availableGenres: string[],
  input: string,
  selectedGenres: string[],
  limit = 10,
): string[] {
  return availableGenres
    .filter((g) => {
      if (!input.trim()) return true;
      const norm = normalizeGenre(g);
      const inputNorm = normalizeGenre(input);
      return (
        norm.includes(inputNorm) ||
        g.toLowerCase().includes(input.toLowerCase())
      );
    })
    .filter((g) => !selectedGenres.includes(g))
    .slice(0, limit);
}
