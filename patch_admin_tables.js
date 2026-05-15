const fs = require('fs');

const files = [
  'src/app/admin/posts/page.tsx',
  'src/app/admin/qa/page.tsx',
  'src/app/admin/consultations/page.tsx',
  'src/app/admin/users/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/categories/CategoryManager.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Only wrap if not already wrapped
    if (!content.includes('<div className="overflow-x-auto w-full">')) {
      content = content.replace(/<table className="w-full text-left">/g, '<div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[800px]">');
      content = content.replace(/<\/table>/g, '</table></div>');
      fs.writeFileSync(file, content);
      console.log("Patched", file);
    }
  }
});
