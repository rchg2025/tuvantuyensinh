const fs = require('fs');

const path = 'src/app/admin/AdminLayoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add useEffect import
if (!content.includes('import { useState, useEffect }')) {
  content = content.replace('import { useState }', 'import { useState, useEffect }');
}

// Add event listener
const hook = `
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("toggleAdminSidebar", handleToggle);
    return () => window.removeEventListener("toggleAdminSidebar", handleToggle);
  }, []);
`;
if (!content.includes('toggleAdminSidebar')) {
  content = content.replace('const [isOpen, setIsOpen] = useState(false);', 'const [isOpen, setIsOpen] = useState(false);\n' + hook);
}

// Hide duplicate header
content = content.replace('className="md:hidden fixed top-0 left-0', 'className="hidden fixed top-0 left-0');
content = content.replace('pt-20 md:pt-8', 'pt-4 md:pt-8'); // Adjust mobile top padding

fs.writeFileSync(path, content);
