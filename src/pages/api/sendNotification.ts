import admin from "@app/application/config/firebaseAdmin";
import { messaging } from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

const chunkArray = (array: any[], size: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const sendNotification = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const db = admin.firestore();
    const { topic, title, body } = req.body;

    // 1. Determine which DB flag strictly governs this notification category
    let flagField = "signalNotification";
    if (topic === "Video_Notification") flagField = "videoNotification";
    else if (topic === "Message_Notification") flagField = "messageNotification";

    console.log(`Sending strict database-filtered notification for: ${flagField}`);

    // 2. Query exactly those Users who have the switch turned ON and possess a push token
    const usersSnap = await db.collection("Users").where(flagField, "==", true).get();

    const targetTokens: string[] = [];
    usersSnap.forEach(doc => {
      const u = doc.data();
      if (u.token) targetTokens.push(u.token);
    });

    if (targetTokens.length === 0) {
      console.log("No valid devices found with notifications enabled for this category.");
      return res.status(200).json({ message: "No tokens found. Enforced database restriction." });
    }

    // 3. Multicast to strictly Enforce Rules (Chunks of 500 max per Firebase limits)
    const tokenChunks = chunkArray(targetTokens, 500);

    for (const chunk of tokenChunks) {
      await messaging().sendEachForMulticast({
        tokens: chunk,
        notification: {
          title,
          body,
        },
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId: 'default', defaultSound: true, priority: 'high' }
        },
        apns: {
          payload: {
            aps: { sound: 'default', contentAvailable: true, mutableContent: true }
          }
        }
      });
    }

    console.log(`Successfully broadcasted to ${targetTokens.length} active authorized tokens.`);
    res.status(200).json({ message: "Se envio estrictamente basado en la db" });

  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};
export default sendNotification;
