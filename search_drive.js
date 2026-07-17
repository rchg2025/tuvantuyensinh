const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');

async function main() {
  const prisma = new PrismaClient();
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: ["GDRIVE_SERVICE_EMAIL", "GDRIVE_PRIVATE_KEY"] } }
  });
  const configMap = configs.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {});
  
  let pk = configMap["GDRIVE_PRIVATE_KEY"];
  try { pk = JSON.parse(pk).private_key; } catch(e) { pk = pk.replace(/\\n/g, '\n'); }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: configMap["GDRIVE_SERVICE_EMAIL"], private_key: pk },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });
  
  const res = await drive.files.list({
    q: "name contains 'Hoc phi'",
    fields: "files(id, name, trashed, parents)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  console.log("Found:", res.data.files);
}
main().catch(console.error);
