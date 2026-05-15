const fs = require('fs');
const path = 'src/app/admin/settings/SettingsForm.tsx';
let content = fs.readFileSync(path, 'utf8');

const field = `          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mã xác minh Google Search Console (Mã Code dạng chuỗi dài)</label>
            <input 
              name="google_site_verification" 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" 
              defaultValue={configMap["google_site_verification"] || ""}
              placeholder="Vd: 31X..."
            />
          </div>`;

content = content.replace(/(<textarea[\s\S]+?name="seo_description"[\s\S]+?<\/textarea>\n\s*<\/div>)/, '$1\n\n' + field);

fs.writeFileSync(path, content);
