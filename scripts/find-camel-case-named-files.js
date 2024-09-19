const fs = require('node:fs');
const path = require('node:path');

// Helper function to check if a filename is in camelCase
function isCamelCase(filename) {
  return /^[a-z]+([A-Z][a-z]*)+$/.test(filename);
}

// Recursive function to search through directories
function findCamelCaseFiles(dir) {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${dir}`, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file.name);

      // Skip node_modules and .git folders
      if (file.name === 'node_modules' || file.name === '.git') {
        return;
      }

      if (file.isDirectory()) {
        // Recursively check subdirectories
        findCamelCaseFiles(filePath);
      } else {
        // Check if the file is camelCase
        const fileNameWithoutExtension = path.basename(file.name, path.extname(file.name));
        if (isCamelCase(fileNameWithoutExtension)) {
          console.log(`CamelCase file found: ${filePath}`);
        }
      }
    });
  });
}

// Start the search from the one level up from the current directory
const startDir = path.join(process.cwd(), '..');
findCamelCaseFiles(startDir);
