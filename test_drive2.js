const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');

async function main() {
  const prisma = new PrismaClient();
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: ["GDRIVE_SERVICE_EMAIL", "GDRIVE_PRIVATE_KEY", "GDRIVE_FOLDER_ID"] } }
  });
  const configMap = configs.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {});
  
  let pk = configMap["GDRIVE_PRIVATE_KEY"];
  try { pk = JSON.parse(pk).private_key; } catch(e) { pk = pk.replace(/\\n/g, '\n'); }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: configMap["GDRIVE_SERVICE_EMAIL"], private_key: pk },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });
  const folderId = configMap["GDRIVE_FOLDER_ID"];
  
  async function getAllSubfolderIds(parentId) {
    let ids = [parentId];
    let toCheck = [parentId];
    
    while(toCheck.length > 0) {
      // Chunk up to 10 at a time to avoid query length limits
      const chunk = toCheck.splice(0, 10);
      const queryParts = chunk.map(id => `'${id}' in parents`);
      const q = `(${queryParts.join(' or ')}) and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      
      try {
        const res = await drive.files.list({
          q: q,
          fields: "files(id)",
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
        
        if (res.data.files && res.data.files.length > 0) {
          const newIds = res.data.files.map(f => f.id);
          ids = ids.concat(newIds);
          toCheck = toCheck.concat(newIds);
        }
      } catch (e) {
        console.error("Error fetching subfolders:", e);
      }
    }
    
    return ids;
  }
  
  console.log("Root folder ID:", folderId);
  const allIds = await getAllSubfolderIds(folderId);
  console.log("All subfolder IDs:", allIds);
}
main().catch(console.error);
