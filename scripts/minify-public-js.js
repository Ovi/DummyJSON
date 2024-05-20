const fs = require('node:fs');
const chokidar = require('chokidar');
const uglifyJS = require('uglify-js');

// Function to minify and compress JavaScript files
function minifyJS(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const result = uglifyJS.minify(code, {
    compress: true, // Enable compression
    mangle: true, // Enable variable name mangling
  });

  if (result.error) {
    console.error(`Error minifying ${filePath}:`, result.error);
    return;
  }

  const minifiedFilePath = filePath.replace(/\.js$/, '.min.js');
  fs.writeFileSync(minifiedFilePath, result.code, 'utf8');
  console.log(`Minified and compressed ${filePath} -> ${minifiedFilePath}`);
}

// Watch the /public/js directory for changes, ignoring .min.js files
const watcher = chokidar.watch('public/js/*.js', {
  ignored: /(^|[\/\\])\..*|\.min\.js$/, // ignore dotfiles and .min.js files
  persistent: true,
});

watcher
  .on('add', filePath => {
    console.log(`File ${filePath} has been added`);
    minifyJS(filePath);
  })
  .on('change', filePath => {
    console.log(`File ${filePath} has been changed`);
    minifyJS(filePath);
  })
  .on('unlink', filePath => {
    console.log(`File ${filePath} has been removed`);
    const minifiedFilePath = filePath.replace(/\.js$/, '.min.js');
    if (fs.existsSync(minifiedFilePath)) {
      fs.unlinkSync(minifiedFilePath);
      console.log(`Removed ${minifiedFilePath}`);
    }
  });

console.log('Watching /public/js for changes...');
