#!/usr/bin/env node
/**
 * Runs `npm audit --omit=dev --json` and fails only on findings that are not
 * explicitly allowlisted below. Use this instead of a bare `npm audit` when a
 * known advisory can't be fixed immediately (e.g. requires a breaking major
 * version bump) so CI doesn't block on an already-triaged, accepted risk.
 *
 * Each allowlist entry must include a reason and a tracking note so the
 * exception doesn't go stale silently.
 */
import { execSync } from "child_process";

const ALLOWLIST = [
  {
    id: "GHSA-mrhx-c7xc-m3w5",
    package: "zod",
    reason:
      "zod <4.6.6 memory-exhaustion-via-unbounded-array advisory. Our zod usage is pinned to v3 " +
      "(~3.25.76) across ~17 validation modules/server actions; upgrading to the patched v4.6.7 " +
      "is a breaking major-version migration that needs dedicated testing, not a drive-by audit fix. " +
      "Revisit: track the v3->v4 migration as its own task.",
  },
];

function run() {
  let json;
  try {
    const output = execSync("npm audit --audit-level=moderate --omit=dev --json", {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    json = JSON.parse(output);
  } catch (err) {
    // npm audit exits non-zero when vulnerabilities are found; stdout still
    // contains the JSON report in that case.
    if (!err.stdout) {
      console.error("npm audit failed to run:", err.message);
      process.exit(1);
    }
    json = JSON.parse(err.stdout);
  }

  const advisoryIds = new Set();
  for (const vuln of Object.values(json.vulnerabilities ?? {})) {
    for (const via of vuln.via ?? []) {
      if (typeof via === "object" && via.url) {
        const match = via.url.match(/GHSA-[a-z0-9-]+$/i);
        if (match) advisoryIds.add(match[0]);
      }
    }
  }

  const allowlistedIds = new Set(ALLOWLIST.map((entry) => entry.id));
  const unexpected = [...advisoryIds].filter((id) => !allowlistedIds.has(id));

  if (allowlistedIds.size > 0) {
    console.log("Known, accepted advisories (suppressed):");
    for (const entry of ALLOWLIST) {
      const present = advisoryIds.has(entry.id) ? "present" : "not currently present";
      console.log(`  - ${entry.id} (${entry.package}, ${present}): ${entry.reason}`);
    }
  }

  if (unexpected.length > 0) {
    console.error("\nUnexpected vulnerabilities found (not in allowlist):");
    for (const id of unexpected) console.error(`  - ${id}`);
    console.error("\nRun `npm audit --omit=dev` locally for full details.");
    process.exit(1);
  }

  console.log("\nNo unexpected vulnerabilities found.");
}

run();
