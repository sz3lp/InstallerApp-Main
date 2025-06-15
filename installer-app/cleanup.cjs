const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function log(message) {
  console.log(message);
}

function deleteFile(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    log(`Deleted ${relativePath}`);
  } else {
    log(`File not found: ${relativePath}`);
  }
}

const rootFiles = [
  'ActivitySummaryPage.jsx',
  'AppointmentSummaryPage.jsx',
  'ChecklistModal.jsx',
  'DocumentViewerModal.jsx',
  'IFIDashboard.jsx',
  'InstallerFeedbackForm.jsx',
  'InstallerHomePage.jsx',
  'JobDetailPage.jsx',
  'useInstallerData.js',
  'rename.txt',
  'rename-jsx-files.js'
];

rootFiles.forEach(deleteFile);

deleteFile(path.join('src', 'main.js'));

const eslintCjs = path.join(rootDir, '.eslintrc.cjs');
const eslintJson = path.join(rootDir, '.eslintrc.json');
if (fs.existsSync(eslintCjs) && fs.existsSync(eslintJson)) {
  fs.unlinkSync(eslintJson);
  log('Deleted .eslintrc.json');
} else {
  log('.eslintrc.json not found or .eslintrc.cjs missing');
}
const feedbackPage = path.join(rootDir, 'src', 'pages', 'FeedbackPage.jsx');
if (fs.existsSync(feedbackPage)) {
  const appFile = path.join(rootDir, 'src', 'App.jsx');
  let appContent = '';
  if (fs.existsSync(appFile)) {
    appContent = fs.readFileSync(appFile, 'utf8');
  }
  const isRouted = appContent.includes('FeedbackPage') || appContent.includes('/feedback');
  if (!isRouted) {
    console.warn('WARNING: FeedbackPage.jsx exists but is not routed. Consider deleting or adding a route.');
  } else {
    log('FeedbackPage.jsx is routed.');
  }
} else {
  log('FeedbackPage.jsx not found.');
}
