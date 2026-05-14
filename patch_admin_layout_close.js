const fs = require('fs');

const path = 'src/app/admin/AdminLayoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'window.addEventListener("toggleAdminSidebar", handleToggle);',
  'window.addEventListener("toggleAdminSidebar", handleToggle);\n    const handleClose = () => setIsOpen(false);\n    window.addEventListener("closeAdminSidebar", handleClose);'
);

content = content.replace(
  'window.removeEventListener("toggleAdminSidebar", handleToggle);',
  'window.removeEventListener("toggleAdminSidebar", handleToggle);\n      window.removeEventListener("closeAdminSidebar", handleClose);'
);

fs.writeFileSync(path, content);
