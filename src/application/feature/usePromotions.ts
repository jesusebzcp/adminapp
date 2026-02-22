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
        // try {
        //   const q = query(collection(db, "Promotions"), orderBy("createdAt", "desc"));
        //   const querySnapshot = await getDocs(q);
        //   const promosArr: any[] = [];
        //   querySnapshot.forEach((doc: any) => {
        //     promosArr.push({ id: doc.id, ...doc.data() });
        //   });
        //   setPromotions(promosArr);
        // } catch (error) {
        //    toast("Ocurrió un error al traer las promociones");
        // }

        // MOCK DATA FOR UI REVIEW
        setPromotions([
            {
                id: "mock-1",
                imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                active: true,
                frequencyType: "always",
                redirectUrl: "https://wa.me/1234567890",
                createdAt: new Date().toISOString()
            },
            {
                id: "mock-2",
                imageUrl: "https://images.unsplash.com/photo-1621252179027-94459d278660?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                active: false,
                frequencyType: "once",
                redirectUrl: "",
                createdAt: new Date().toISOString()
            },
            {
                id: "mock-3",
                imageUrl: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                active: true,
                frequencyType: "weekly",
                redirectUrl: "https://instagram.com/codigo_369",
                createdAt: new Date().toISOString()
            }
        ]);
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
