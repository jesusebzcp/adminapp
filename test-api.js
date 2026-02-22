const admin = require("firebase-admin");
const serviceAccount = require("./creds.json");
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function run() {
  const db = admin.firestore();
  
  // 1. Fetch all Firestore Users
  const usersSnapshot = await db.collection("Users").get();
  const firestoreUsers = {};
  usersSnapshot.forEach(doc => {
      firestoreUsers[doc.id] = { id: doc.id, ...doc.data() };
  });

  // Test Andres
  const uid = "1G7cHkKWBMSzZZp56CFlshKzFC83";
  const emailLower = "ortegacorreaa@gmail.com";

  const byUserId = Object.values(firestoreUsers).find(u => u.userId === uid) || {};
  const byEmail = Object.values(firestoreUsers).find(u => u.email?.toLowerCase() === emailLower) || {};
  const byDocId = firestoreUsers[uid] || {};

  console.log("byUserId:", byUserId);
  console.log("byEmail:", byEmail);
  console.log("byDocId:", byDocId);

  // Smart Merge for rol priority
  const mergedFData = { ...byUserId, ...byEmail, ...byDocId };
  if (byUserId.rol === 'admin' || byEmail.rol === 'admin' || byDocId.rol === 'admin') {
      mergedFData.rol = 'admin';
  }

  console.log("MERGED:", mergedFData);

  process.exit(0);
}
run();
