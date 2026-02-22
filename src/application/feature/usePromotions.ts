import { db } from "@app/application/config/firebase";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { storage, ref } from "@app/application/config/firebase";
import { deleteObject } from "firebase/storage";

export function usePromotions() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getPromotions = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "Promotions"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const promosArr: any[] = [];
            querySnapshot.forEach((doc: any) => {
                promosArr.push({ id: doc.id, ...doc.data() });
            });
            setPromotions(promosArr);
        } catch (error) {
            toast.error("Ocurrió un error al traer las promociones");
        }
        setLoading(false);
    };

    const onDelete = async (id: string, imageUrl: string) => {
        try {
            // Optional: Delete from storage if it's a firebase storage URL
            if (imageUrl && imageUrl.includes("firebasestorage")) {
                try {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                } catch (e) {
                    console.log("Could not delete image from storage", e);
                }
            }

            await deleteDoc(doc(db, "Promotions", id));
            toast.success("Promoción eliminada con éxito");
        } catch (error) {
            toast("Error eliminando la promoción");
        }
    };

    useEffect(() => {
        getPromotions();
    }, []);

    return {
        promotions,
        loading,
        getPromotions,
        onDelete,
    };
}
