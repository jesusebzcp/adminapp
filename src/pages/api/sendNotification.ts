import admin from "@app/application/config/firebaseAdmin";
import { messaging } from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

const sendNotification = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
) => {
  try {
    const firebase = admin;
    await messaging().send({
      topic: req.body.topic,
      notification: {
        title: req.body.title,
        body: req.body.body,
      },
      // Configuración Explicita para que SUENE en Android
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
          defaultSound: true,
          priority: 'high'
        }
      },
      // Configuración Explicita para que SUENE en iOS
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true,
            mutableContent: true,
          }
        }
      }
    });
    res.status(200).json({ message: "Se envio" });
  } catch (error) {
    console.log("error", error);
  }
};
export default sendNotification;
