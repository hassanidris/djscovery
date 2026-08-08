import { readdirSync, statSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const KB = 1024;

const BUDGETS = {
  perRoute: 250 * KB,
  perChunk: 500 * KB,
  sharedChunks: 1200 * KB,
  sharedGzipped: 1200 * KB,
};

const BUILD_DIR = join(projectRoot, ".next");
const STATIC_DIR = join(BUILD_DIR, "static");

function formatBytes(bytes) {
  if (bytes < KB) return `${bytes}B`;
  return `${(bytes / KB).toFixed(1)}KB`;
}

function findFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function getRouteFromPath(filePath) {
  const staticRelative = filePath.replace(STATIC_DIR + "/", "");
  const parts = staticRelative.split("/");
  if (parts[0] === "chunks") return "shared";
  if (parts[0] === "pages") {
    return parts.slice(1, -1).join("/") || "/";
  }
  return parts[0];
}

function checkBundle() {
  if (!existsSync(BUILD_DIR)) {
    console.error(
      "ERROR: .next build directory not found. Run 'npm run build' first.",
    );
    process.exit(1);
  }

  if (!existsSync(STATIC_DIR)) {
    console.error("ERROR: .next/static directory not found.");
    process.exit(1);
  }

  const jsFiles = findFiles(STATIC_DIR, ".js");
  const cssFiles = findFiles(STATIC_DIR, ".css");

  const jsStats = jsFiles.map((file) => {
    const size = statSync(file).size;
    const gzippedSize = Math.round(size * 0.3);
    const route = getRouteFromPath(file);
    return { file, size, gzippedSize, route, type: "js" };
  });

  const cssStats = cssFiles.map((file) => {
    const size = statSync(file).size;
    const gzippedSize = Math.round(size * 0.3);
    const route = getRouteFromPath(file);
    return { file, size, gzippedSize, route, type: "css" };
  });

  const allStats = [...jsStats, ...cssStats];

  const violations = [];
  const warnings = [];

  const routeTotals = {};
  for (const stat of allStats) {
    const key = stat.route;
    if (!routeTotals[key]) {
      routeTotals[key] = { js: 0, css: 0, gzipped: 0, files: 0 };
    }
    routeTotals[key][stat.type] += stat.size;
    routeTotals[key].gzipped += stat.gzippedSize;
    routeTotals[key].files += 1;

    if (stat.type === "js" && stat.size > BUDGETS.perChunk) {
      violations.push(
        `  VIOLATION: ${stat.file.replace(projectRoot + "/", "")} - ${formatBytes(stat.size)} exceeds per-chunk budget of ${formatBytes(BUDGETS.perChunk)}`,
      );
    }
  }

  for (const [route, totals] of Object.entries(routeTotals)) {
    const totalSize = totals.js + totals.css;
    if (route !== "shared" && totalSize > BUDGETS.perRoute) {
      warnings.push(
        `  WARNING: Route "${route}" total ${formatBytes(totalSize)} (est. gzip ${formatBytes(totals.gzipped)}) exceeds per-route budget of ${formatBytes(BUDGETS.perRoute)}`,
      );
    }
    if (route === "shared" && totals.gzipped > BUDGETS.sharedGzipped) {
      warnings.push(
        `  WARNING: Shared chunks total ${formatBytes(totalSize)} (est. gzip ${formatBytes(totals.gzipped)}) exceeds shared gzip budget of ${formatBytes(BUDGETS.sharedGzipped)}`,
      );
    }
  }

  console.log("\n=== Bundle Size Report ===\n");

  const sortedRoutes = Object.entries(routeTotals).sort(
    ([, a], [, b]) => b.js + b.css - (a.js + a.css),
  );

  console.log("Route / Chunk Breakdown (raw / est. gzip):");
  console.log("-".repeat(70));
  for (const [route, totals] of sortedRoutes) {
    const total = totals.js + totals.css;
    const flag = total > BUDGETS.perRoute && route !== "shared" ? " !" : "";
    console.log(
      `  ${route.padEnd(30)} ${formatBytes(total).padStart(12)} / ${formatBytes(totals.gzipped).padStart(10)} (${totals.files} files)${flag}`,
    );
  }

  const totalJs = jsStats.reduce((sum, s) => sum + s.size, 0);
  const totalCss = cssStats.reduce((sum, s) => sum + s.size, 0);
  const totalAll = totalJs + totalCss;
  const totalGzipped = Math.round(totalAll * 0.3);

  console.log("-".repeat(70));
  console.log(
    `  ${"TOTAL".padEnd(30)} ${formatBytes(totalAll).padStart(12)} / ${formatBytes(totalGzipped).padStart(10)}`,
  );
  console.log(`    JS:  ${formatBytes(totalJs)} (${jsStats.length} files)`);
  console.log(`    CSS: ${formatBytes(totalCss)} (${cssStats.length} files)`);

  console.log(`\nBudgets:`);
  console.log(`  Per-route:  ${formatBytes(BUDGETS.perRoute)}`);
  console.log(`  Per-chunk:  ${formatBytes(BUDGETS.perChunk)}`);
  console.log(`  Shared:     ${formatBytes(BUDGETS.sharedChunks)}`);

  if (violations.length > 0) {
    console.log("\nViolations:");
    violations.forEach((v) => console.log(v));
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log(w));
  }

  if (violations.length > 0) {
    console.log(
      `\n${violations.length} violation(s) found. Bundle size check FAILED.`,
    );
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(
      `\n${warnings.length} warning(s). Bundle size check PASSED with warnings.`,
    );
  } else {
    console.log("\nAll bundles within budget. Bundle size check PASSED.");
  }

  process.exit(0);
}

checkBundle();
