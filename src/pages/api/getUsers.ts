import { NextApiRequest, NextApiResponse } from 'next';
import admin from '@app/application/config/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const db = admin.firestore();

        // 1. Fetch all Firestore Users to get roles and notifications
        const usersSnapshot = await db.collection("Users").get();
        const firestoreUsers: Record<string, any> = {};
        usersSnapshot.forEach(doc => {
            firestoreUsers[doc.id] = { id: doc.id, ...doc.data() };
        });

        // 2. Fetch all Subscriptions
        const subsSnapshot = await db.collection("subscription").get();
        const subscriptions: Record<string, any> = {};
        subsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.email) {
                subscriptions[data.email.toLowerCase()] = { id: doc.id, ...data, processed: false };
            }
        });

        // 3. Fetch all Auth Users
        let allAuthUsers: admin.auth.UserRecord[] = [];
        let pageToken: string | undefined = undefined;
        do {
            const listUsersResult = await admin.auth().listUsers(1000, pageToken);
            allAuthUsers = allAuthUsers.concat(listUsersResult.users);
            pageToken = listUsersResult.pageToken;
        } while (pageToken);

        // 4. Merge Data
        const combinedList: any[] = [];

        // First, process all auth users
        allAuthUsers.forEach(authUser => {
            if (!authUser.email) return;

            const emailLower = authUser.email.toLowerCase();

            let fData = firestoreUsers[authUser.uid] || {};
            const byEmail = Object.values(firestoreUsers).find(u => u.email?.toLowerCase() === emailLower);

            // Merge both documents if they exist. Priority: Auth -> UID doc -> Email doc
            // The UID doc usually only has the fcm token and notifications.
            // The Email doc usually has manually assigned roles or phone numbers.
            const mergedFData = { ...byEmail, ...fData };

            const subData = subscriptions[emailLower];

            let endISO = null;
            if (subData?.endDate) {
                try {
                    endISO = typeof subData.endDate.toDate === 'function' ? subData.endDate.toDate().toISOString() : new Date(subData.endDate).toISOString();
                } catch (e) {
                    // Ignore parsing errors for malformed dates
                }
            }

            combinedList.push({
                id: mergedFData.id || authUser.uid,
                userId: authUser.uid,
                email: authUser.email,
                name: authUser.displayName || mergedFData.name || "Sin Nombre",
                phone: authUser.phoneNumber || mergedFData.phone || "",
                rol: mergedFData.rol || "user",
                signalNotification: mergedFData.signalNotification === undefined ? true : Boolean(mergedFData.signalNotification),
                messageNotification: mergedFData.messageNotification === undefined ? true : Boolean(mergedFData.messageNotification),
                videoNotification: mergedFData.videoNotification === undefined ? true : Boolean(mergedFData.videoNotification),
                subscriptionId: subData?.id,
                endDate: endISO,
                createdAt: authUser.metadata.creationTime,
            });

            // Mark subscription as processed
            if (subData) subscriptions[emailLower].processed = true;
        });

        // Add remaining manual users from Firestore that aren't in Auth
        Object.values(firestoreUsers).forEach(fUser => {
            if (fUser.email && !combinedList.find(c => c.email.toLowerCase() === fUser.email.toLowerCase())) {
                const emailLower = fUser.email.toLowerCase();
                const subData = subscriptions[emailLower];

                let endISO = null;
                if (subData?.endDate) {
                    try {
                        endISO = typeof subData.endDate.toDate === 'function' ? subData.endDate.toDate().toISOString() : new Date(subData.endDate).toISOString();
                    } catch (e) { }
                }

                combinedList.push({
                    id: fUser.id,
                    userId: fUser.userId || fUser.id,
                    email: fUser.email,
                    name: fUser.name || "Manual User",
                    phone: fUser.phone || "",
                    rol: fUser.rol || "user",
                    signalNotification: fUser.signalNotification ?? true,
                    messageNotification: fUser.messageNotification ?? true,
                    videoNotification: fUser.videoNotification ?? true,
                    subscriptionId: subData?.id,
                    endDate: endISO,
                    createdAt: typeof fUser.createdAt?.toDate === 'function' ? fUser.createdAt.toDate().toISOString() : new Date().toISOString(),
                });
                if (subData) subscriptions[emailLower].processed = true;
            }
        });

        // Add purely orphan subscriptions
        Object.values(subscriptions).forEach(sub => {
            if (!sub.processed && sub.email) {
                let endISO = null;
                if (sub.endDate) {
                    try {
                        endISO = typeof sub.endDate.toDate === 'function' ? sub.endDate.toDate().toISOString() : new Date(sub.endDate).toISOString();
                    } catch (e) { }
                }

                combinedList.push({
                    id: `orphan-${sub.id}`,
                    userId: '',
                    email: sub.email,
                    name: 'Cliente Externo',
                    phone: '',
                    rol: 'Desconocido',
                    signalNotification: false,
                    messageNotification: false,
                    videoNotification: false,
                    subscriptionId: sub.id,
                    endDate: endISO,
                    createdAt: new Date().toISOString()
                });
            }
        });

        combinedList.sort((a, b) => a.email.localeCompare(b.email));
        return res.status(200).json(combinedList);
    } catch (error: any) {
        console.error('Error fetching CRM users:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
