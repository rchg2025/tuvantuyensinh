const fs = require('fs');
const path = 'src/app/admin/settings/actions.ts';
let content = fs.readFileSync(path, 'utf8');

// Add field to extract
if (!content.includes('google_site_verification =')) {
  content = content.replace('const seo_description', 'const google_site_verification = formData.get("google_site_verification")?.toString() || "";\n    const seo_description');
}

// Add map to save
if (!content.includes('{ key: "google_site_verification"')) {
  content = content.replace('{ key: "seo_description"', '{ key: "google_site_verification", value: google_site_verification },\n      { key: "seo_description"');
}

fs.writeFileSync(path, content);
