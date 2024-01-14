import { initialState } from "@app/presentantion/components/FormSignal";
import { collection, getDocs } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export const useSignals = () => {
  const [signals, setVideos] = useState<(typeof initialState)[]>([]);
  async function getVideos() {
    try {
      const videosCol = collection(db, "Signals");
      const videosSnapshot = await getDocs(videosCol);
      const videosList: any = videosSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setVideos(videosList);
    } catch (error) {
      console.log("Error", error);
    }
  }
  useEffect(() => {
    getVideos();
  }, []);
  return {
    signals,
    getVideos,
  };
};
