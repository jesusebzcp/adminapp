import admin from "firebase-admin";

try {
  if (!admin.apps.length) {
    let credentialInfo;

    // Attempt local file fallback strictly for safety when env is dropped
    try {
      if (process.env.NEXT_PUBLIC_JSON) {
        credentialInfo = JSON.parse(process.env.NEXT_PUBLIC_JSON);
      } else {
        const path = require('path');
        const fs = require('fs');
        const credsPath = path.resolve(process.cwd(), 'creds.json');
        if (fs.existsSync(credsPath)) {
          credentialInfo = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Firebase credentials", parseError);
    }

    admin.initializeApp({
      ...(credentialInfo ? { credential: admin.credential.cert(credentialInfo) } : {}),
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || undefined,
    });
    console.log("Firebase Admin Initialized Successfully.");
  }
} catch (error: any) {
  /*
   * We skip the "already exists" message which is
   * not an actual error when we're hot-reloading.
   */
  if (!/already exists/u.test(error?.message)) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

export default admin;
