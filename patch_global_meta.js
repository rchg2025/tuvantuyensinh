const fs = require('fs');
const path = 'src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const defaultOpenGraph = `openGraph: {
      title: titleConf?.value || "Tư Vấn Tuyển Sinh",
      description: descConf?.value || "Trang thông tin tư vấn tuyển sinh",
      images: ["https://cover-talk.zadn.vn/f/d/8/d/2/a423757e2c651160a43bdd630334ecc7.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: titleConf?.value || "Tư Vấn Tuyển Sinh",
      description: descConf?.value || "Trang thông tin tư vấn tuyển sinh",
      images: ["https://cover-talk.zadn.vn/f/d/8/d/2/a423757e2c651160a43bdd630334ecc7.jpg"],
    },`;

content = content.replace(
  'icons: {',
  defaultOpenGraph + '\n    icons: {'
);

fs.writeFileSync(path, content);
console.log("Metadata patched in layout.tsx");
