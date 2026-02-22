import { collection, deleteDoc, doc, getDocs } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  tag?: string; // ID de la categoría (tag)
  id: string;
};

export const useVideos = () => {
  const [videos, setVideos] = useState<VideoDocument[]>([]);
  const [loading, setLoading] = useState(true);

  async function getVideos() {
    setLoading(true);
    // try {
    //   const videosCol = collection(db, "videos");
    //   const videosSnapshot = await getDocs(videosCol);
    //   const videosList: any = videosSnapshot.docs.map((doc) => ({
    //     ...doc.data(),
    //     id: doc.id,
    //   }));
    //   setVideos(videosList);
    // } catch (error) {
    //   console.log("Error", error);
    // }

    // MOCK DATA
    setVideos([
      {
        id: "v-1",
        title: "Análisis Semanal Oro",
        description: "Revisando zonas clave para el XAU/USD",
        coverUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "",
        attachment: [],
        comments: ["Buen video!", "Gracias"],
        create: { seconds: 12345, nanoseconds: 0 },
        tag: "DwhhUz1j0t0wi6AnB9ZD" // Pre apertura
      },
      {
        id: "v-2",
        title: "Estrategia Nasdaq",
        description: "Operando el NQ1 al inicio de semana",
        coverUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        videoUrl: "",
        attachment: [],
        comments: [],
        create: { seconds: 12345, nanoseconds: 0 },
        tag: "XTfyJZpHTlrk4ywsD5zZ" // Codigo Enigma
      }
    ]);
    setLoading(false);
  }

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "videos", id));
      await getVideos();
      toast.success("Se a eliminado el video con éxito.");
    } catch (error) {
      alert("Ocurrió un error al eliminar la señal");
    }
  };
  useEffect(() => {
    getVideos();
  }, []);
  return {
    videos,
    loading,
    getVideos,
    handleDeleteVideo,
  };
};
