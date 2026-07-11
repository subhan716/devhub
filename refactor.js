const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.js') || dirFile.endsWith('.jsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync(path.join(__dirname, 'frontend', 'src'));

let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Regex to match 'http://localhost:5000/api...', "http://localhost:5000...", `http://localhost:5000...`
  // And replace with `${import.meta.env.VITE_API_URL}...` enclosed in backticks
  content = content.replace(/['"`]http:\/\/localhost:5000([^'"`]*)['"`]/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Updated:', file);
  }
});
console.log('Total files updated:', changedFiles);
