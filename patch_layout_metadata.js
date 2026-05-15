const fs = require('fs');

const path = 'src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace title with template object
const replaceRegex = /title: titleConf\?\.value \|\| "Tư Vấn Tuyển Sinh",/g;

// Read google_site_verification
content = content.replace(
  'const logoConf = await prisma.systemConfig.findUnique({ where: { key: "logo_url" } });',
  `const logoConf = await prisma.systemConfig.findUnique({ where: { key: "logo_url" } });
  const googleVerification = await prisma.systemConfig.findUnique({ where: { key: "google_site_verification" } });`
);

let siteTitleCode = `const siteTitle = titleConf?.value || "Tư Vấn Tuyển Sinh";`;
if (!content.includes('const siteTitle = titleConf')) {
    content = content.replace('let faviconUrl', siteTitleCode + '\n  let faviconUrl');
}

content = content.replace(/(?<=return \{\n\s*)title: titleConf\?\.value \|\| "Tư Vấn Tuyển Sinh",/, 
    `title: {
      template: \`%s | \${siteTitle}\`,
      default: siteTitle,
    },`);

content = content.replace(/(?<=openGraph: \{\n\s*)title: titleConf\?\.value \|\| "Tư Vấn Tuyển Sinh",/, 
    `title: {
        template: \`%s | \${siteTitle}\`,
        default: siteTitle,
      },`);

// Add verification metadata
const verificationCode = `
    ...(googleVerification?.value ? {
      verification: {
        google: googleVerification.value,
      }
    } : {}),`;

content = content.replace('icons: {', verificationCode + '\n    icons: {');

fs.writeFileSync(path, content);
