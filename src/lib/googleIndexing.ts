import { google } from 'googleapis';

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
// Handle newlines in private key securely
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

let jwtClient: any = null;

if (clientEmail && privateKey) {
  jwtClient = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
}

/**
 * Notifies Google Indexing API to update or delete a URL.
 * @param url The exact URL to index (e.g. https://ts26.nsg.edu.vn/posts/my-post)
 * @param type 'URL_UPDATED' for creation/update, 'URL_DELETED' for deletion
 */
export async function notifyGoogleIndexingApi(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  if (!jwtClient) {
    console.warn('Google Indexing API is not configured (missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY)');
    return;
  }

  try {
    await jwtClient.authorize();
    
    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient,
    });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type,
      },
    });

    console.log(`Google Indexing API: Successfully requested ${type} for ${url}`);
    return response.data;
  } catch (error: any) {
    console.error('Error notifying Google Indexing API:', error?.message || error);
  }
}
