import { collection, deleteDoc, doc, getDocs } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import dayjs from "dayjs";

export const useSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function getSubscriptions() {
        setLoading(true);
        let subsList: any[] = [];
        try {
            const subsCol = collection(db, "subscription");
            const subsSnapshot = await getDocs(subsCol);
            subsList = subsSnapshot.docs.map((d) => {
                const data = d.data();
                let endDate = data.endDate;
                if (endDate?.seconds) {
                    endDate = dayjs(endDate.seconds * 1000).toDate();
                } else if (typeof endDate === 'string' || typeof endDate === 'number') {
                    endDate = dayjs(endDate).toDate();
                }
                return {
                    ...data,
                    id: d.id,
                    endDate
                };
            });
        } catch (error) {
            console.log("Error", error);
        } finally {
            // Inject mock data if empty. Since Firebase is likely empty for testing...
            if (subsList.length === 0) {
                subsList = [
                    {
                        id: "mock-sub-1",
                        email: "andres@ia369.com",
                        endDate: dayjs().add(30, 'day').toDate(),
                        membershipType: "VIP"
                    },
                    {
                        id: "mock-sub-2",
                        email: "usuario.vencido@gmail.com",
                        endDate: dayjs().subtract(5, 'day').toDate(),
                        membershipType: "Mensual"
                    },
                    {
                        id: "mock-sub-3",
                        email: "nuevo.trader@hotmail.com",
                        endDate: dayjs().add(365, 'day').toDate(),
                        membershipType: "Anual"
                    }
                ];
            }
            setSubscriptions(subsList);
            setLoading(false);
        }
    }

    const onDelete = async (id: string) => {
        try {
            if (!id.startsWith('mock-')) {
                await deleteDoc(doc(db, "subscription", id));
            }
            getSubscriptions();
        } catch (error) {
            alert("Ocurrió un error al eliminar la suscripción");
        }
    };

    useEffect(() => {
        getSubscriptions();
    }, []);

    return {
        subscriptions,
        getSubscriptions,
        loading,
        onDelete,
    };
};
