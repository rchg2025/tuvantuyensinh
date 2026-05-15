const fs = require('fs');

const path = 'src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldVerificationCode = `google: googleVerification.value,`;
const newVerificationCode = `google: googleVerification.value.replace(/.*content=["']([^"']+)["'].*/, '$1').replace('google-site-verification=', '').trim(),`;

content = content.replace(oldVerificationCode, newVerificationCode);

fs.writeFileSync(path, content);
console.log("Patched verification logic in layout.tsx");
