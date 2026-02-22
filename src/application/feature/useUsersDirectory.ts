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
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/getUsers?t=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch CRM users");
            }
            const data: UserDirectoryData[] = await response.json();
            setUsers(data);
        } catch (error) {
            console.log("Error fetching directory:", error);
            toast.error("Error al cargar el directorio de clientes.");
        } finally {
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
