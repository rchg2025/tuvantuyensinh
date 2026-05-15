const fs = require('fs');

const path = 'src/app/posts/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace overflow-x-hidden with overflow-x-auto to make it scrollable
content = content.replace('overflow-x-hidden', 'overflow-x-auto');

fs.writeFileSync(path, content);
