const fs = require('fs');

const path = 'src/app/posts/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import linkifyHtml')) {
  content = content.replace('import { Metadata } from "next";', 'import { Metadata } from "next";\nimport linkifyHtml from "linkify-html";');
}

// Ensure the HTML has links clickified
const renderRegex = /dangerouslySetInnerHTML={{ __html: post\.content }}/;
const replaceCode = 'dangerouslySetInnerHTML={{ __html: linkifyHtml(post.content, { defaultProtocol: "https", target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline" }) }}';

if (!content.includes('linkifyHtml(post.content')) {
  content = content.replace(renderRegex, replaceCode);
}

fs.writeFileSync(path, content);
