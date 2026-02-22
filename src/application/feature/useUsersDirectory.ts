import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import dayjs from "dayjs";
import { toast } from "sonner";

export interface UserDirectoryData {
    id: string; // Document ID in Users collection
    userId: string; // Auth UID
    email: string;
    name: string;
    phone: string;
    rol: string;
    signalNotification: boolean;
    messageNotification: boolean;
    videoNotification: boolean;
    // Subscription related below
    subscriptionId?: string; // Document ID in subscription collection
    endDate?: Date | null;
    createdAt?: any;
}

export const useUsersDirectory = () => {
    const [users, setUsers] = useState<UserDirectoryData[]>([]);
    const [loading, setLoading] = useState(true);

    async function getUsersDirectory() {
        setLoading(true);
        let combinedList: UserDirectoryData[] = [];

        try {
            // 1. Fetch all users
            const usersCol = collection(db, "Users");
            const usersSnapshot = await getDocs(usersCol);
            const fetchedUsers: Record<string, Partial<UserDirectoryData>> = {};

            usersSnapshot.docs.forEach((d) => {
                const data = d.data();
                const email = data.email?.toLowerCase();
                if (email) {
                    fetchedUsers[email] = {
                        id: d.id,
                        userId: data.userId || '',
                        email: email,
                        name: data.name || '',
                        phone: data.phone || '',
                        rol: data.rol || 'user',
                        signalNotification: data.signalNotification ?? true,
                        messageNotification: data.messageNotification ?? true,
                        videoNotification: data.videoNotification ?? true,
                        createdAt: data.createdAt,
                    };
                }
            });

            // 2. Fetch all subscriptions
            const subsCol = collection(db, "subscription");
            const subsSnapshot = await getDocs(subsCol);
            const fetchedSubs: Record<string, any> = {};

            subsSnapshot.docs.forEach((d) => {
                const data = d.data();
                const email = data.email?.toLowerCase();
                if (email) {
                    let endDate = data.endDate;
                    if (endDate?.seconds) {
                        endDate = dayjs(endDate.seconds * 1000).toDate();
                    } else if (typeof endDate === 'string' || typeof endDate === 'number') {
                        endDate = dayjs(endDate).toDate();
                    }

                    fetchedSubs[email] = {
                        subscriptionId: d.id,
                        endDate: endDate,
                    };
                }
            });

            // 3. Merge data based on email
            Object.keys(fetchedUsers).forEach((email) => {
                combinedList.push({
                    ...(fetchedUsers[email] as UserDirectoryData),
                    ...(fetchedSubs[email] || {}) // Apply subscription if exists
                });
            });

            // Special case: orphan subscriptions without a user doc
            // (Rare in production, but good to catch for admin panels)
            Object.keys(fetchedSubs).forEach((email) => {
                if (!fetchedUsers[email]) {
                    combinedList.push({
                        id: `orphan-${fetchedSubs[email].subscriptionId}`,
                        userId: '',
                        email: email,
                        name: 'Usuario sin registro',
                        phone: '',
                        rol: 'Desconocido',
                        signalNotification: false,
                        messageNotification: false,
                        videoNotification: false,
                        ...fetchedSubs[email]
                    });
                }
            });

            // Sort by email for consistency
            combinedList.sort((a, b) => a.email.localeCompare(b.email));

        } catch (error) {
            console.log("Error fetching directory:", error);
            toast.error("Error al cargar el directorio de clientes.");
        } finally {
            // 4. Fallback Mock Data for UI Designing if empty
            if (combinedList.length === 0) {
                combinedList = [
                    {
                        id: "mock-user-1",
                        userId: "uid-1",
                        email: "andres@ia369.com",
                        name: "Andres VIP",
                        phone: "+123456789",
                        rol: "admin",
                        signalNotification: true,
                        messageNotification: true,
                        videoNotification: true,
                        subscriptionId: "mock-sub-1",
                        endDate: dayjs().add(30, 'day').toDate()
                    },
                    {
                        id: "mock-user-2",
                        userId: "uid-2",
                        email: "usuario.gratis@gmail.com",
                        name: "Juan Perez",
                        phone: "+987654321",
                        rol: "user",
                        signalNotification: false,
                        messageNotification: true,
                        videoNotification: false,
                        // NO SUBSCRIPTION
                    },
                    {
                        id: "mock-user-3",
                        userId: "uid-3",
                        email: "trader.vencido@hotmail.com",
                        name: "Maria Lopez",
                        phone: "",
                        rol: "user",
                        signalNotification: true,
                        messageNotification: true,
                        videoNotification: true,
                        subscriptionId: "mock-sub-3",
                        endDate: dayjs().subtract(5, 'day').toDate()
                    }
                ];
            }

            setUsers(combinedList);
            setLoading(false);
        }
    }

    const deleteSubscriptionRecord = async (subscriptionId: string) => {
        try {
            if (!subscriptionId.startsWith('mock-')) {
                await deleteDoc(doc(db, "subscription", subscriptionId));
            }
            getUsersDirectory();
            toast.success("Suscripción eliminada.");
        } catch (error) {
            console.log(error);
            toast.error("Ocurrió un error al eliminar la suscripción");
        }
    };

    const promoteToAdmin = async (userIdStr: string, documentId: string) => {
        try {
            if (!documentId.startsWith("mock-")) {
                await updateDoc(doc(db, "Users", documentId), {
                    rol: "admin"
                });
            }
            getUsersDirectory();
            toast.success("Privilegios de administrador concedidos.");
        } catch (e) {
            console.log(e);
            toast.error("No se pudo promover al usuario.");
        }
    };

    useEffect(() => {
        getUsersDirectory();
    }, []);

    return {
        users,
        getUsersDirectory,
        loading,
        deleteSubscriptionRecord,
        promoteToAdmin
    };
};
