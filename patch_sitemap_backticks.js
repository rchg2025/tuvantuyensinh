const fs = require('fs');

const path = 'src/app/sitemap.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace bad backslashes before backticks
content = content.replace(/\\\`/g, '`');
content = content.replace(/\\$/g, '');

fs.writeFileSync(path, content);
