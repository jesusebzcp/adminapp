import { NextApiRequest, NextApiResponse } from 'next';
import admin from '@app/application/config/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email y nueva contraseña son requeridos' });
        }

        if (newPassword.length < 6) {
             return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        console.log(`Intentando actualizar la contraseña para el usuario: ${email}`);

        let userRecord;
        try {
            // Intentar obtener el usuario primero para ver si existe en Auth
            userRecord = await admin.auth().getUserByEmail(email);
            
            // Si existe, actualizamos su contraseña
            await admin.auth().updateUser(userRecord.uid, {
                password: newPassword,
            });
            console.log(`Contraseña actualizada exitosamente para UID: ${userRecord.uid}`);
            
        } catch (authError: any) {
            if (authError.code === 'auth/user-not-found') {
                console.log(`Usuario no encontrado en Firebase Auth. Creando nuevo registro Auth para ${email}`);
                // El usuario no existe en Auth (quizás fue creado solo en la DB de Firestore)
                // Lo creamos en Firebase Auth
                userRecord = await admin.auth().createUser({
                    email: email,
                    password: newPassword,
                });
                console.log(`Nuevo usuario creado en Auth con UID: ${userRecord.uid}`);
            } else {
                // Otro tipo de error
                throw authError; // Relanzar para que lo atrape el bloque catch principal
            }
        }

        return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
        console.error('Error actualizando contraseña:', error);
        return res.status(500).json({ success: false, error: 'Error del servidor', details: error.message });
    }
}
