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
      // Inject beautifully crafted mock signals for UI structural review alongside real ones (or empty array if failed)
      const sampleSignals = [
        {
          id: "mock-1",
          defaultCurrency: "EUR",
          currency: "USD",
          action: "COMPRA",
          entryPrice: "1.0850",
          takeProfit: "1.0950",
          stopLoss: "1.0750",
          relativeRisk: "1:2",
          orderType: "Market Execution",
          comment: "Esperando rompimiento de liquidez asiática",
          status: "Activa",
          image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
          date: new Date()
        },
        {
          id: "mock-2",
          defaultCurrency: "Nasdaq",
          currency: "",
          action: "VENTA",
          entryPrice: "18500",
          takeProfit: "18300",
          stopLoss: "18600",
          relativeRisk: "1:3",
          orderType: "Sell Limit",
          comment: "Rechazo en bloque de órdenes H4 Institucional.",
          status: "Pendiente",
          image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop",
          date: new Date()
        }
      ];

      setVideos([...fetchedSignals, ...sampleSignals]);
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
