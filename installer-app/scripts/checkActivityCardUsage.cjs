const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(message);
}

function checkUsage() {
  try {
    const pagesDir = path.join(__dirname, '..', 'src', 'installer', 'pages');
    log(`Checking for imports of ActivityCard in ${pagesDir}`);
    const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
    let imported = false;
    pageFiles.forEach(file => {
      const contents = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      if (contents.includes('ActivityCard')) {
        log(`Found reference in ${file}`);
      }
      if (/from ['"]..\/installer\/components\/ActivityCard['"]/.test(contents) ||
          /from ['"]..\/components\/ActivityCard['"]/.test(contents)) {
        imported = true;
      }
    });
    if (!imported) {
      console.warn('ActivityCard.jsx is only used in tests. Consider importing it into ActivitySummaryPage or removing it.');
    }
  } catch (err) {
    console.error('Error while checking ActivityCard usage:', err);
  }
}

checkUsage();
