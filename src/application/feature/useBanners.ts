import { collection, deleteDoc, doc, getDocs, query, orderBy, updateDoc } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export const useBanners = () => {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function getBanners() {
        setLoading(true);
        let fetched: any[] = [];
        try {
            const col = collection(db, "banners");
            const q = query(col, orderBy("order", "asc"));
            const snapshot = await getDocs(q);
            const list: any = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            fetched = list;
        } catch (error) {
            console.log("Error fetching banners", error);
        } finally {
            setBanners(fetched);
            setLoading(false);
        }
    }

    const onDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "banners", id));
            getBanners();
        } catch (error) {
            alert("Ocurrió un error al eliminar el banner");
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "banners", id), { isActive: !currentStatus });
            getBanners();
        } catch (error) {
            alert("Ocurrió un error al actualizar el banner");
        }
    };

    useEffect(() => {
        getBanners();
    }, []);

    return {
        banners,
        getBanners,
        loading,
        onDelete,
        toggleActive
    };
};
