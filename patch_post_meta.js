const fs = require('fs');
const path = 'src/app/posts/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const defaultImage = '"https://cover-talk.zadn.vn/f/d/8/d/2/a423757e2c651160a43bdd630334ecc7.jpg"';
content = content.replace(/images: imageUrl \? \[imageUrl\] : \[\]/g, `images: imageUrl ? [imageUrl] : [${defaultImage}]`);

fs.writeFileSync(path, content);
console.log("Metadata patched in post detail page");
