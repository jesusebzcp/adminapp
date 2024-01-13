import { collection, getDocs } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export type VideoDocument = {
  attachment: string[]; // array de cadenas para los archivos adjuntos
  comments: string[]; // array de cadenas para los comentarios
  coverUrl: string; // URL de la portada
  create: {
    seconds: number; // segundos desde la época
    nanoseconds: number; // nanosegundos
  };
  description: string; // descripción del video
  title: string; // título del video
  videoUrl: string; // URL del video
  id: string;
};

export const useVideos = () => {
  const [videos, setVideos] = useState<VideoDocument[]>([]);
  async function getVideos() {
    try {
      const videosCol = collection(db, "videos");
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
    videos,
    getVideos,
  };
};
