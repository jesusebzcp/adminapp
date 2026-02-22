const admin = require("firebase-admin");
const serviceAccount = require("./creds.json");
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check(email) {
  console.log(`\n--- Checking ${email} ---`);

  // Check Auth
  try {
    const authUser = await admin.auth().getUserByEmail(email);
    console.log("AUTH USER:", {
      uid: authUser.uid,
      displayName: authUser.displayName,
      phoneNumber: authUser.phoneNumber
    });

    // Check Users by UID
    const docByUid = await db.collection("Users").doc(authUser.uid).get();
    if (docByUid.exists) {
      console.log("USERS doc by UID:", docByUid.data());
    } else {
      console.log("No USERS doc found by UID.");
    }
  } catch (e) { console.log("Auth User not found:", e.message) }

  // Check Users by email
  const snap = await db.collection("Users").where("email", "==", email).get();
  snap.forEach(d => console.log("USERS doc by email (ID:", d.id, "):", d.data()));

  // Check subscription
  const subSnap = await db.collection("subscription").where("email", "==", email).get();
  subSnap.forEach(d => console.log("SUB doc by email (ID:", d.id, "):", d.data()));
}

async function run() {
  await check("ortegacorreaa@gmail.com");
  await check("migue@codigoenigma.com");
  process.exit(0);
}
run();
