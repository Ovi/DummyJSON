const fs = require('node:fs');
const path = require('node:path');

const { source, target } = getTargetAndSource();

if (!source || !target) {
  console.error('Please provide source and target');
  process.exit(1);
}

console.log(`Source: ${source}`);
console.log(`Target: ${target}`);

const rootDirectory = path.resolve(__dirname, '..');

// Directories where we want to perform replacements
const viewsDirectory = path.join(rootDirectory, '/views');
const publicDirectory = path.join(rootDirectory, '/public');

// Function to recursively traverse directories and replace content in files
function traverseDirectory(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);

      fs.stat(filePath, (error, stat) => {
        if (error) {
          console.error('Error stating file:', error);
          return;
        }

        if (stat.isDirectory()) {
          if (filePath.startsWith(viewsDirectory) || filePath.startsWith(publicDirectory)) {
            traverseDirectory(filePath); // Recursive call for views and public directories
          }
        } else if (filePath.startsWith(viewsDirectory) || filePath.startsWith(publicDirectory)) {
          replaceInFile(filePath); // Call replace function for files in views and public directories
        }
      });
    });
  });
}

// Function to replace content in a single file
function replaceInFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    if (!['.ejs', '.js', '.html', '.css', '.scss', '.json', '.md'].includes(path.extname(filePath))) {
      return;
    }

    // Perform the replacement
    const updatedContent = data.replace(new RegExp(source, 'g'), target);

    const didUpdate = updatedContent !== data;

    // Write back to the file
    fs.writeFile(filePath, updatedContent, 'utf8', error => {
      if (error) {
        console.error('Error writing to file:', error);
      } else if (didUpdate) {
        console.log(`File updated: ${filePath}`);
      } else {
        console.log(`Skipped file: ${filePath}`);
      }
    });
  });
}

// Start the traversal from the root directory
traverseDirectory(rootDirectory);

function getTargetAndSource() {
  const args = process.argv.slice(2);

  let s;
  let t;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target') {
      t = args[i + 1];
    } else if (args[i] === '--source') {
      s = args[i + 1];
    }
  }

  return { source: s, target: t };
}
