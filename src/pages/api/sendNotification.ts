import admin from "@app/application/config/firebaseAdmin";
import { messaging } from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

const sendNotification = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { topic, title, body } = req.body;

    console.log(`Sending broad topic-based notification to: ${topic}`);

    await messaging().send({
      topic: topic,
      notification: {
        title,
        body,
      },
      // Configuración Explicita para que SUENE en Android
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'default', defaultSound: true, priority: 'high' }
      },
      // Configuración Explicita para que SUENE en iOS
      apns: {
        payload: {
          aps: { sound: 'default', contentAvailable: true, mutableContent: true }
        }
      }
    });

    res.status(200).json({ message: "Se envió la notificación por Tópico (Topic) a la app móvil." });

  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to send notification via Topic" });
  }
};
export default sendNotification;
