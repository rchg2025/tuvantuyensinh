const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');

const prisma = new PrismaClient();

const credentials = {
  "client_email": "ts26-721@nam-sai-gon-310312.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxgQo38zcMLpeZ\nTW13PHhfIfrn20EPpc3gDhlSY2FJ8sTaEMZbhCCayk3zFKWHjBHBXNj++mqHUTBB\nghM2qy2hlXHv9GMn1b3GhjgHxV/OXRzsq9oS/rVy0vzT4T2FVSaKuZZHRd95QJbj\nk3wjdh9IlGwFML1Q7EjdRhQrPtrM0CQY6QYHT2jQmroyTrP3TyoluhHs6U5cXJdf\nCZzOx5NZ6PS7N5Gn5tT1fgrdEdoW0mOaIWrGg5Kl3yPa8U4Nr2VcFkNFSJWLFBiq\nmsMk/ol4UWd3b/H6aOIFQS6QzT1/L/qGvPV4oBY12txMuImKSwG2njCaXa/iRr5N\nVvA5uK5pAgMBAAECggEAATQnECwJ4PFM/YOsuEWarVZLUNydn0m6R95C0t5MnW45\noV39el6xCqaDk8PHVyjG9ooUX2BgaBIkggBrBCNGwrYQ222gKlRf/8s8K/HPwTC4\nVgxiksIYamL8wvORAHfTPDGJsEb36yYHUiOErD1SLmeDgsjyMurnSUE6IQyEUQ5B\nM1W85voex9cI6OwUXzn+spjjjoKV0V+2HWQkLW5Cn2N+/UYZEi/B/3ckSV7/z6uq\nEpP3GMa+hTzDrrzAPvxPoM5t7Es+u9dHof29rAjDun3SoYN2M4sgkIxdoUDMHem+\nWuOnej5okmawWss0oV0K/kqdP6GmqmDd3ZXTj/DC4QKBgQDqKlfr34+EuVKJSFmV\n3WYWQZxNOHIuxL8bTvpg3uVMEZIOLblEksyH+ZBTq8O551XYEQ+zOv7KJE/AbND1\ndXQpsWQ7ebrz0PqOtPqjsuxc/Wbg3YfrbASDQMtTtl5aY7R/4dB45Fuc9sqKC2ec\nWpIRN9k/xhf12CDbe2mMUkhH3wKBgQDCDijAKxPYeC1QxTIoG2sWtG4FWjk4iQQm\nmjWbKhoc0vVcyWAhvmroaCqCOPu0DsmGYUsZM0sgLYBTO/eHgFaLzrHFEw0OuNVk\nt3mbw7hqjSoA2eNwnsiEbAz86D3s2pH5tmli68OGdm7Lw9aKNX5aMT3nT9ZXBL7y\nz/FEOXRytwKBgQCSQEgRhdu5ZZXrMEjjlRgBppDcmfiWxUMm5zjx78T+saqrOFuS\nPK2J75D48TqZjabMADvyEVK5Jdy5rj0EUYtvzt9vViQxy7/yCY7RVxrRKWNr5nDR\n1PEsmPdlHW3ovoUpqfvuxZGCg5EUjvLzcI3yOxNxBWRJo+dBrd7KSUnjuQKBgCDf\ngSu8oGoFQbfzD+IXcvavrgueEx9uppNbgEU+xpmnawVC39QXi8i/DKRuvsTr1Fu9\nU5l7RPi4fIqdF/uOVBru8tJtvcKGsS+UnTcz2qPCMiFex9amL1WvcCvPs93R0PS6\nX/Pv+HloyrAeBtP25+ajfNcYgTjQhwBfFYH3MbDVAoGBAL+6JiCfp8ks+AVJNJYB\nziwxIP2L1lDndM+JInrBWD4tBuj4iPu0LIrwpr/MlAVWsNC8UUvj2TxrRVsgSyCh\nRsJceWL/Xm1s8QSpMlv4QTY+t5vYmDFpaCBxmin3dFyqVXbn3biM8BAf05NsG7JQ\nZX/v6IJRhCAYz/FaFa35YC8R\n-----END PRIVATE KEY-----\n"
};

async function main() {
  const jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/indexing']
  });

  try {
    await jwtClient.authorize();
    const indexing = google.indexing({ version: 'v3', auth: jwtClient });
    
    // Fetch all posts from DB
    const posts = await prisma.post.findMany({ select: { slug: true } });
    console.log(`Found ${posts.length} posts to index...`);

    const baseUrl = 'https://ts26.nsg.edu.vn';
    
    for (const post of posts) {
      const url = `${baseUrl}/posts/${post.slug}`;
      try {
        const response = await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: 'URL_UPDATED'
          }
        });
        console.log(`Pushed to Google: ${url}`);
      } catch(err) {
        console.error(`Failed to push ${url}:`, err.message);
      }
    }
    
    console.log("Finished pushing all posts to Google Indexing API.");
  } catch(e) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
