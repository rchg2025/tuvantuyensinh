const https = require('https');
const { execSync } = require('child_process');

function check() {
  https.get('https://ts26.nsg.edu.vn/googled80bda7a14bff58e.html', (res) => {
    if (res.statusCode === 200) {
      console.log("File is live! Running verification...");
      try {
        const output = execSync('node verify-sa-2.js');
        console.log(output.toString());
      } catch (e) {
        console.error(e.toString());
      }
    } else {
      console.log("Not live yet, status:", res.statusCode);
      setTimeout(check, 10000); // check again in 10s
    }
  }).on('error', (e) => {
    console.error(e);
    setTimeout(check, 10000);
  });
}

check();
