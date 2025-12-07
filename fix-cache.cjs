const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'docs', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// Add timestamp to script tag as comment to break cache
const timestamp = Date.now();
html = html.replace('<body>', `<body>\n  <!-- Build: ${timestamp} -->`);

// Also add to head
html = html.replace('</head>', `  <meta name="build-time" content="${timestamp}" />\n</head>`);

fs.writeFileSync(indexPath, html);
console.log(`✓ Added cache-busting timestamp: ${timestamp}`);
