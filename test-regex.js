const text = "Truy cập [Link này](https://google.com). Hoặc https://fb.com/abc. Gọi 0987.654.321 nhé.";
let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

const links = [];
html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, title, url) => {
  links.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline font-bold text-blue-600 hover:opacity-80 relative z-50 cursor-pointer" style="pointer-events: auto;">${title}</a>`);
  return `__LINK_${links.length - 1}__`;
});

html = html.replace(/(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, (match) => {
  links.push(`<a href="${match}" target="_blank" rel="noopener noreferrer" class="underline font-bold text-blue-600 hover:opacity-80 relative z-50 cursor-pointer" style="pointer-events: auto;">${match}</a>`);
  return `__LINK_${links.length - 1}__`;
});

html = html.replace(/(0\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4})/g, (match) => {
  const cleanNumber = match.replace(/[\s.-]/g, '');
  return `<a href="tel:${cleanNumber}" class="underline font-bold text-blue-600 hover:opacity-100 relative z-50 cursor-pointer" style="pointer-events: auto;">${match}</a>`;
});

html = html.replace(/__LINK_(\d+)__/g, (match, index) => {
  return links[parseInt(index, 10)];
});

console.log(html);
