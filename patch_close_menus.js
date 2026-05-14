const fs = require('fs');

const path = 'src/app/MobileHeaderClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('const toggleSidebar = () => {', 'const toggleSidebar = () => {\n    setIsHeaderMenuOpen(false);');

// Make the Header toggler dispatch an event to close sidebar just to be safe
content = content.replace(
  'onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}',
  'onClick={() => {\n          setIsHeaderMenuOpen(!isHeaderMenuOpen);\n          if (!isHeaderMenuOpen) window.dispatchEvent(new CustomEvent("closeAdminSidebar"));\n        }}'
);

fs.writeFileSync(path, content);
