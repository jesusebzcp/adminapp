import admin from "@app/application/config/firebaseAdmin";
import { messaging } from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

const sendNotification = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  // 1. Configurar CORS para permitir que la App Móvil llame a este servidor seguro
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: { sound: 'default' }
        }
      }
    });

    res.status(200).json({ message: "Se envió la notificación por Tópico (Topic) a la app móvil." });

  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to send notification via Topic", details: error.message });
  }
};
export default sendNotification;
