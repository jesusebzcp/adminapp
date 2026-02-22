import { initialState } from "@app/presentantion/components/FormSignal";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export const useSignals = () => {
  const [signals, setVideos] = useState<(typeof initialState)[]>([]);
  const [loading, setLoading] = useState(true);

  async function getSignals() {
    setLoading(true);
    let fetchedSignals: any[] = [];
    try {
      const videosCol = collection(db, "Signals");
      const videosSnapshot = await getDocs(videosCol);
      const videosList: any = videosSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      fetchedSignals = videosList;
    } catch (error) {
      console.log("Error", error);
    } finally {
      setVideos(fetchedSignals);
      setLoading(false);
    }
  }

  const onDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Signals", id));
      getSignals();
    } catch (error) {
      alert("Ocurrió un error al eliminar la señal");
    }
  };
  useEffect(() => {
    getSignals();
  }, []);
  return {
    signals,
    getSignals,
    loading,
    onDelete,
  };
};
