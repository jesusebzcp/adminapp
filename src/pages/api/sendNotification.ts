import admin from "@app/application/config/firebaseAdmin";
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

    await admin.messaging().send({
      topic: topic,
      notification: {
        title: title || "Nueva Notificación",
        body: body || "Abre la aplicación para ver más detalles",
      },
      // Configuración Explicita para alta prioridad en Android
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
          defaultSound: true,
          priority: 'max'
        }
      },
      // Configuración Explicita, Irrompible y Estandarizada para Apple (iOS)
      apns: {
        headers: {
          'apns-priority': '10', // 10 = Entrega INMEDIATA (Requiere interacción usuario)
          'apns-push-type': 'alert'
        },
        payload: {
          aps: {
            alert: {
              title: title,
              body: body
            },
            sound: 'default',
            badge: 1,
            contentAvailable: true, // Wakes up the app in background
            mutableContent: true    // Allows Notification Service Extension (Rich Media)
          }
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
