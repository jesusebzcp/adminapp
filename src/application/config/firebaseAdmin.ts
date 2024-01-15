import admin from "firebase-admin";

try {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.NEXT_PUBLIC_JSON as string)
    ),
    storageBucket: process.env.NEXT_PUBLIC_JSON,
  });
  console.log("Initialized.");
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
