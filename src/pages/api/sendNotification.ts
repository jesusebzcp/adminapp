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
      // ✅ Configuración para ANDROID (Sonido + Alta Prioridad)
      android: {
        priority: 'high',
        notification: {
            sound: 'default',
            channelId: 'default',
            defaultSound: true,
            priority: 'high'
        }
      },
      // ✅ Configuración para iOS (Sonido)
      apns: {
        payload: {
            aps: {
                sound: 'default',
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
