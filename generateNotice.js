const fs = require('fs');

// Read the licenses.json file
const licenses = JSON.parse(fs.readFileSync('licenses.json', 'utf8'));

// Prepare the NOTICE content
let noticeContent = "NOTICE FILE\n\nThis project includes dependencies with the following licenses:\n\n";

for (const [pkg, info] of Object.entries(licenses)) {
    noticeContent += `Package: ${pkg}\n`;
    noticeContent += `Version: ${info.version}\n`;
    noticeContent += `License: ${info.licenses}\n`;
    noticeContent += `Repository: ${info.repository}\n\n`;
}

// Write the NOTICE file
fs.writeFileSync('NOTICE', noticeContent);

console.log('NOTICE file has been generated successfully.');

