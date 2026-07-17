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
  
  const foldersToRestore = ['1_TCS3Xaq2eS7qNVWI9FythmHBZWFGbOg', '1amIPfF7ii5ce-Mxon1RAAcV0U50i1vkZ'];
  
  for (const id of foldersToRestore) {
    try {
      await drive.files.update({
        fileId: id,
        requestBody: { trashed: false },
        supportsAllDrives: true,
      });
      console.log("Restored folder:", id);
    } catch(e) {
      console.error("Error restoring", id, e.message);
    }
  }
}
main().catch(console.error);
