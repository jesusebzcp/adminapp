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
    const { topic, title, body, type, data } = req.body;

    let finalTitle = title || "Nueva Notificación";
    let finalBody = body || "Abre la aplicación para ver más detalles";

    // Centralized Phrase Logic (Vercel Source of Truth)
    if (type === 'signal') {
      const assetStr = data?.asset ? ` en ${data.asset}` : '';
      finalTitle = `🎯 Nueva Operación Oficial${assetStr}`;
      finalBody = "Abre la aplicación para ver los parámetros detallados.";
    } else if (type === 'news') {
      finalTitle = `📰 Actualización de Mercado IA369`;
      finalBody = "Revisa las últimas noticias y análisis en tu portal.";
    }

    console.log(`Sending broad topic-based notification to: ${topic} - Title: ${finalTitle}`);

    await admin.messaging().send({
      topic: topic,
      notification: {
        title: finalTitle,
        body: finalBody,
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
              title: finalTitle,
              body: finalBody
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
