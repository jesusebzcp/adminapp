import { NextApiRequest, NextApiResponse } from 'next';
import admin from '@app/application/config/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { uid, email, subscriptionId, docId } = req.body;
        const db = admin.firestore();

        console.log("Deleting User:", { uid, email, subscriptionId, docId });

        // 1. Delete from Firebase Auth
        if (uid && !uid.startsWith('orphan-') && !uid.startsWith('manual-')) {
            try {
                await admin.auth().deleteUser(uid);
                console.log(`Successfully deleted user ${uid} from Firebase Auth`);
            } catch (authError: any) {
                console.log(`Failed to delete user ${uid} from Auth (may not exist):`, authError.message);
            }
        } else if (email) {
            try {
                const authUser = await admin.auth().getUserByEmail(email);
                await admin.auth().deleteUser(authUser.uid);
                console.log(`Successfully deleted user ${email} from Firebase Auth`);
            } catch (authError: any) {
                console.log(`Failed to find/delete user ${email} from Auth:`, authError.message);
            }
        }

        // 2. Delete from Users Collection
        if (docId && !docId.startsWith('orphan-')) {
            await db.collection("Users").doc(docId).delete();
            console.log(`Deleted Users doc: ${docId}`);
        }

        // Also try deleting by email if docId was missed
        if (email) {
            const userDocs = await db.collection("Users").where("email", "==", email.toLowerCase()).get();
            const deletePromises = userDocs.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
            console.log(`Deleted ${deletePromises.length} orphaned Users docs by email`);
        }

        // 3. Delete from Subscription Collection
        if (subscriptionId && !subscriptionId.startsWith('mock-')) {
            await db.collection("subscription").doc(subscriptionId).delete();
            console.log(`Deleted Subscription doc: ${subscriptionId}`);
        }

        if (email) {
            const subDocs = await db.collection("subscription").where("email", "==", email.toLowerCase()).get();
            const subPromises = subDocs.docs.map(doc => doc.ref.delete());
            await Promise.all(subPromises);
            console.log(`Deleted ${subPromises.length} orphaned Subscription docs by email`);
        }

        return res.status(200).json({ success: true, message: 'Usuario eliminado por completo de todas las bases de datos.' });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
