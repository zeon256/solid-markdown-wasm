#!/usr/bin/env bun
/**
 * GitHub Actions SHA Verifier
 *
 * This script verifies that the GitHub Actions in your workflow files
 * are pinned to the correct commit SHAs for their tagged versions.
 *
 * Usage:
 *   bun verify-actions.ts                    # Verify all workflow files
 *   bun verify-actions.ts --update         # Update SHAs to latest versions
 *   bun verify-actions.ts --strict         # Fail on any mismatch
 *
 * Why SHA pinning?
 * - Prevents supply chain attacks where a compromised action tag could execute malicious code
 * - Immutable references - once pinned, the code cannot change
 * - Required by many security compliance frameworks (SLSA, SSDF, etc.)
 */

import { readFile, writeFile } from "node:fs/promises";
import { glob } from "glob";

interface ActionInfo {
  owner: string;
  repo: string;
  version: string;
  currentSha: string | null;
  lineNumber: number;
  fullMatch: string;
}

interface VerificationResult {
  action: ActionInfo;
  expectedSha: string | null;
  isValid: boolean;
  error?: string;
}

// Regex to match GitHub Actions uses statements
// Matches: uses: owner/repo@sha # version
// Or: uses: owner/repo@version
const ACTION_REGEX =
  /uses:\s*([^/]+)\/([^@\s]+)@([a-f0-9]{40}|v?\d+(?:\.\d+)*(?:-[\w.]+)?)(?:\s+#\s*(v?\d+(?:\.\d+)*(?:-[\w.]+)?))?/gi;

// Alternative regex for the common pattern: uses: owner/repo@sha # version
const ACTION_WITH_COMMENT_REGEX =
  /uses:\s*([^/]+)\/([^@\s]+)@([a-f0-9]{40})\s+#\s*(v?\d+(?:\.\d+)*(?:-[\w.]+)?)/gi;

const actionShaCache = new Map<string, string | null>();
const fetchedActionKeys = new Set<string>();

async function fetchLatestSha(
  owner: string,
  repo: string,
  version: string,
): Promise<string | null> {
  const cacheKey = `${owner}/${repo}@${version}`.toLowerCase();
  if (fetchedActionKeys.has(cacheKey)) {
    return actionShaCache.get(cacheKey) ?? null;
  }

  try {
    // Remove 'v' prefix if present for API call
    const tagVersion = version.startsWith("v") ? version : `v${version}`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/tags/${tagVersion}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "github-actions-sha-verifier",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`  ⚠️  Tag ${tagVersion} not found in ${owner}/${repo}`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both direct commits and annotated tags
    if (data.object.type === "commit") {
      fetchedActionKeys.add(cacheKey);
      actionShaCache.set(cacheKey, data.object.sha);
      return data.object.sha;
    }

    if (data.object.type === "tag") {
      // Fetch the annotated tag to get the actual commit
      const tagResponse = await fetch(data.object.url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "github-actions-sha-verifier",
        },
      });

      if (!tagResponse.ok) {
        throw new Error(`Failed to fetch tag: ${tagResponse.statusText}`);
      }

      const tagData = await tagResponse.json();
      fetchedActionKeys.add(cacheKey);
      actionShaCache.set(cacheKey, tagData.object.sha);
      return tagData.object.sha;
    }

    fetchedActionKeys.add(cacheKey);
    actionShaCache.set(cacheKey, null);
    return null;
  } catch (error) {
    console.error(
      `  ❌ Error fetching SHA for ${owner}/${repo}@${version}:`,
      error,
    );
    fetchedActionKeys.add(cacheKey);
    actionShaCache.set(cacheKey, null);
    return null;
  }
}

async function parseWorkflowFile(filePath: string): Promise<ActionInfo[]> {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const actions: ActionInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Try matching SHA + comment pattern first (preferred format)
    ACTION_WITH_COMMENT_REGEX.lastIndex = 0;
    const shaMatch = ACTION_WITH_COMMENT_REGEX.exec(line);

    if (shaMatch) {
      actions.push({
        owner: shaMatch[1],
        repo: shaMatch[2],
        currentSha: shaMatch[3],
        version: shaMatch[4],
        lineNumber: i + 1,
        fullMatch: shaMatch[0],
      });
      continue;
    }

    // Fall back to general pattern (version-only pins)
    ACTION_REGEX.lastIndex = 0;
    const match = ACTION_REGEX.exec(line);

    if (match) {
      const versionOrSha = match[3];
      const isSha = /^[a-f0-9]{40}$/.test(versionOrSha);

      actions.push({
        owner: match[1],
        repo: match[2],
        currentSha: isSha ? versionOrSha : null,
        version: isSha ? match[4] || "unknown" : versionOrSha,
        lineNumber: i + 1,
        fullMatch: match[0],
      });
    }
  }

  return actions;
}

async function verifyAction(action: ActionInfo): Promise<VerificationResult> {
  const expectedSha = await fetchLatestSha(
    action.owner,
    action.repo,
    action.version,
  );

  if (!expectedSha) {
    return {
      action,
      expectedSha: null,
      isValid: false,
      error: "Could not fetch expected SHA from GitHub API",
    };
  }

  if (!action.currentSha) {
    return {
      action,
      expectedSha,
      isValid: false,
      error: `Not pinned to SHA (currently using version tag ${action.version})`,
    };
  }

  return {
    action,
    expectedSha,
    isValid: action.currentSha.toLowerCase() === expectedSha.toLowerCase(),
  };
}

async function verifyWorkflowFile(
  filePath: string,
): Promise<VerificationResult[]> {
  console.log(`\n📄 Checking ${filePath}...`);

  const actions = await parseWorkflowFile(filePath);

  if (actions.length === 0) {
    console.log("  ℹ️  No GitHub Actions found");
    return [];
  }

  console.log(`  Found ${actions.length} action(s)`);

  const results: VerificationResult[] = [];

  for (const action of actions) {
    process.stdout.write(
      `  • ${action.owner}/${action.repo}@${action.version}... `,
    );

    const result = await verifyAction(action);
    results.push(result);

    if (result.isValid) {
      console.log("✅");
    } else if (result.error) {
      console.log(`❌ ${result.error}`);
      if (result.expectedSha) {
        console.log(`     Expected: ${result.expectedSha}`);
        console.log(`     Got:      ${action.currentSha}`);
      }
    } else {
      console.log("❌ SHA mismatch!");
      console.log(`     Expected: ${result.expectedSha}`);
      console.log(`     Got:      ${action.currentSha}`);
    }
  }

  return results;
}

async function updateWorkflowFile(filePath: string): Promise<void> {
  console.log(`\n📝 Updating ${filePath}...`);

  let content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const actions = await parseWorkflowFile(filePath);

  for (const action of actions) {
    const expectedSha = await fetchLatestSha(
      action.owner,
      action.repo,
      action.version,
    );

    if (!expectedSha) {
      console.log(
        `  ⚠️  Could not fetch SHA for ${action.owner}/${action.repo}@${action.version}`,
      );
      continue;
    }

    if (action.currentSha?.toLowerCase() === expectedSha.toLowerCase()) {
      console.log(
        `  ✓ ${action.owner}/${action.repo}@${action.version} already up to date`,
      );
      continue;
    }

    // Replace in the specific line
    const lineIndex = action.lineNumber - 1;
    const oldLine = lines[lineIndex];

    // Create new line with updated SHA
    const newLine = oldLine.replace(
      /uses:\s*([^/]+)\/([^@\s]+)@[a-f0-9]{40}/i,
      `uses: ${action.owner}/${action.repo}@${expectedSha}`,
    );

    if (newLine === oldLine) {
      // Try alternative pattern (version tag -> SHA)
      const newLine2 = oldLine.replace(
        new RegExp(
          `uses:\\s*${action.owner}/${action.repo}@${action.version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?!\\s*#)`,
          "i",
        ),
        `uses: ${action.owner}/${action.repo}@${expectedSha} # ${action.version}`,
      );

      if (newLine2 !== oldLine) {
        lines[lineIndex] = newLine2;
        console.log(
          `  ↑ ${action.owner}/${action.repo}@${action.version} -> ${expectedSha}`,
        );
      } else {
        console.log(
          `  ⚠️  Could not update ${action.owner}/${action.repo}@${action.version}`,
        );
      }
    } else {
      lines[lineIndex] = newLine;
      console.log(
        `  ↑ ${action.owner}/${action.repo}@${action.version} -> ${expectedSha}`,
      );
    }
  }

  content = lines.join("\n");
  await writeFile(filePath, content, "utf-8");
  console.log(`  💾 Saved ${filePath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const shouldUpdate = args.includes("--update");
  const strictMode = args.includes("--strict");

  console.log("🔐 GitHub Actions SHA Verifier");
  console.log("==============================");

  if (shouldUpdate) {
    console.log("\n⚠️  UPDATE MODE: Will update SHAs to latest versions\n");
  }

  // Find all workflow files
  const workflowFiles = await glob(".github/workflows/**/*.{yml,yaml}");

  if (workflowFiles.length === 0) {
    console.log("❌ No workflow files found in .github/workflows/");
    process.exit(1);
  }

  console.log(`Found ${workflowFiles.length} workflow file(s)`);

  let allResults: VerificationResult[] = [];

  for (const file of workflowFiles) {
    if (shouldUpdate) {
      await updateWorkflowFile(file);
    } else {
      const results = await verifyWorkflowFile(file);
      allResults = allResults.concat(results);
    }
  }

  if (!shouldUpdate) {
    console.log("\n==============================");

    const invalidCount = allResults.filter((r) => !r.isValid).length;
    const validCount = allResults.filter((r) => r.isValid).length;
    const notPinnedCount = allResults.filter(
      (r) => !r.isValid && r.error?.includes("Not pinned to SHA"),
    ).length;

    console.log("\n📊 Summary:");
    console.log(`   ✅ Valid SHA pins: ${validCount}`);
    console.log(`   ❌ Invalid/Mismatched: ${invalidCount - notPinnedCount}`);
    console.log(`   ⚠️  Not SHA-pinned: ${notPinnedCount}`);

    if (invalidCount === 0) {
      console.log("\n🎉 All actions are correctly pinned to verified SHAs!");
    } else {
      console.log(`\n⚠️  ${invalidCount} action(s) need attention`);

      if (strictMode) {
        console.log("\n❌ Exiting with error (strict mode)");
        process.exit(1);
      }
    }
  }
}

main().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
