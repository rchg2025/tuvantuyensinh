const fs = require('fs');

const path = 'src/app/globals.css';
let content = fs.readFileSync(path, 'utf8');

// Update table CSS to be responsive
const oldTableRule = `.post-content table, .jodit-wysiwyg table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}`;

const newTableRule = `.post-content table, .jodit-wysiwyg table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
  display: block;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}`;

if (content.includes(oldTableRule)) {
  content = content.replace(oldTableRule, newTableRule);
} else {
  // If not exactly matching, just append to CSS
  content += "\n\n/* Ensure all tables are horizontally scrollable on mobile */\n.post-content table, .jodit-wysiwyg table {\n  display: block;\n  max-width: 100%;\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n}";
}

fs.writeFileSync(path, content);
