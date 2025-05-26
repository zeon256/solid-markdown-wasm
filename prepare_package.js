const fs = require("node:fs");
const path = require("node:path");

const packageJsonPath = path.join(__dirname, "release-package", "package.json");

fs.readFile(packageJsonPath, "utf8", (err, data) => {
  if (err) {
    console.error("Failed to read package.json:", err);
    process.exit(1);
    return;
  }

  try {
    const packageJson = JSON.parse(data);

    // Remove dependencies
    delete packageJson.dependencies;

    // Remove devDependencies
    delete packageJson.devDependencies;

    // Remove scripts
    delete packageJson.scripts;

    const updatedPackageJson = JSON.stringify(packageJson, null, 2);

    fs.writeFile(packageJsonPath, updatedPackageJson, "utf8", (writeErr) => {
      if (writeErr) {
        console.error("Failed to write updated package.json:", writeErr);
        process.exit(1);
        return;
      }
      console.log("Successfully prepared package.json for publishing.");
    });
  } catch (parseErr) {
    console.error("Failed to parse package.json:", parseErr);
    process.exit(1);
  }
});
