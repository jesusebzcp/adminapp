import admin from "firebase-admin";

try {
  if (!admin.apps.length) {
    let credentialInfo;
    try {
      if (process.env.NEXT_PUBLIC_JSON) {
        credentialInfo = JSON.parse(process.env.NEXT_PUBLIC_JSON);
      }
    } catch (parseError) {
      console.error("Failed to parse NEXT_PUBLIC_JSON");
    }

    admin.initializeApp({
      ...(credentialInfo ? { credential: admin.credential.cert(credentialInfo) } : {}),
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || undefined,
    });
    console.log("Firebase Admin Initialized.");
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
