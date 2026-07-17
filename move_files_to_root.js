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
  const rootFolderId = configMap["GDRIVE_FOLDER_ID"];
  
  // Known subfolders from previous run
  const subfolders = ['1_TCS3Xaq2eS7qNVWI9FythmHBZWFGbOg', '1amIPfF7ii5ce-Mxon1RAAcV0U50i1vkZ'];

  for (const folderId of subfolders) {
    console.log("Processing folder:", folderId);
    let pageToken = null;
    do {
      const res = await drive.files.list({
        q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed=false`,
        fields: 'nextPageToken, files(id, name, parents)',
        pageToken: pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      
      const files = res.data.files || [];
      for (const file of files) {
        console.log(`Moving file ${file.name} (ID: ${file.id}) to root folder...`);
        const previousParents = file.parents ? file.parents.join(',') : '';
        await drive.files.update({
          fileId: file.id,
          addParents: rootFolderId,
          removeParents: previousParents,
          fields: 'id, parents',
          supportsAllDrives: true,
        });
      }
      
      pageToken = res.data.nextPageToken;
    } while (pageToken);
    
    // Delete the empty subfolder
    try {
        await drive.files.delete({ fileId: folderId, supportsAllDrives: true });
        console.log(`Deleted folder ${folderId}`);
    } catch (e) {
        console.error(`Failed to delete folder ${folderId}:`, e.message);
    }
  }
  console.log("Done!");
}

main().catch(console.error);
