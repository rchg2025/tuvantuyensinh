const fs = require('fs');

const path = 'src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Imports update
if (!content.includes('import MobileHeaderClient from "./MobileHeaderClient"')) {
  content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport MobileHeaderClient from "./MobileHeaderClient";');
}

// Add handleLogout function
const logoutAction = `
  async function handleLogout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("auth_name");
    redirect("/login");
  }
`;
if (!content.includes('async function handleLogout()')) {
  content = content.replace('const zaloOaWidget = configMap["zalo_oa_widget"] || "";', 'const zaloOaWidget = configMap["zalo_oa_widget"] || "";\n' + logoutAction);
}

// Replace the hardcoded mobile menu
const menuCode = `          {/* Mobile Secondary Menu Row */}
          <MobileHeaderClient 
            isLoggedIn={isLoggedIn} 
            authName={authName!} 
            menuTree={menuTree} 
            postCategories={postCategories} 
            handleLogout={handleLogout} 
          />
        </header>`;

// Use regex to replace everything from "          {/* Mobile Secondary Menu Row */}" to "</header>"
content = content.replace(/\s*\{\/\* Mobile Secondary Menu Row \*\/\}[\s\S]*?<\/header>/, '\n' + menuCode);

fs.writeFileSync(path, content);
