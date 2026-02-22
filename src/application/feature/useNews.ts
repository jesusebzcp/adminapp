import { collection, deleteDoc, doc, getDocs, query, orderBy } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export const useNews = () => {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function getNews() {
        setLoading(true);
        let fetchedNews: any[] = [];
        try {
            const messagesCol = collection(db, "Messages");
            const q = query(messagesCol, orderBy("date", "desc"));
            const snapshot = await getDocs(q);
            const list: any = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            fetchedNews = list;
        } catch (error) {
            console.log("Error fetching news", error);
        } finally {
            setNews(fetchedNews);
            setLoading(false);
        }
    }

    const onDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "Messages", id));
            getNews();
        } catch (error) {
            alert("Ocurrió un error al eliminar la noticia");
        }
    };

    useEffect(() => {
        getNews();
    }, []);

    return {
        news,
        getNews,
        loading,
        onDelete,
    };
};
