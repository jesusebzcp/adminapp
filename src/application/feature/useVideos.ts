import { collection, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore/lite";
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
  orderIndex?: number; // Numeración opcional para sobreescribir el orden
};

export const useVideos = () => {
  const [videos, setVideos] = useState<VideoDocument[]>([]);
  const [loading, setLoading] = useState(true);

  async function getVideos() {
    setLoading(true);
    try {
      const videosCol = collection(db, "videos");
      // Since orderIndex is new and older videos won't have it, we pull all and sort locally 
      // to avoid composite index requirements in Firestore right now.
      const videosSnapshot = await getDocs(videosCol);
      const videosList: VideoDocument[] = videosSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as VideoDocument[];

      // Sort logic: use orderIndex if exists, else fallback to creation timestamp desc
      videosList.sort((a, b) => {
        const orderA = a.orderIndex !== undefined ? a.orderIndex : 999999;
        const orderB = b.orderIndex !== undefined ? b.orderIndex : 999999;

        if (orderA !== orderB) {
          return orderA - orderB; // ascending numeric
        }

        // Secondary sort: most recent first if ties or missing orderIndex
        const timeA = a.create?.seconds || 0;
        const timeB = b.create?.seconds || 0;
        return timeB - timeA;
      });

      setVideos(videosList);
    } catch (error) {
      console.log("Error", error);
    }
    setLoading(false);
  }

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "videos", id));
      await getVideos();
      toast.success("Se ha eliminado el video con éxito.");
    } catch (error) {
      alert("Ocurrió un error al eliminar el video");
    }
  };

  const updateVideoOrder = async (orderedVideos: VideoDocument[]) => {
    try {
      const batch = writeBatch(db);

      // Loop through the visually ordered array and assign new orderIndex
      orderedVideos.forEach((video, index) => {
        const vidRef = doc(db, "videos", video.id);
        // We explicitly assign an increasing orderIndex
        batch.update(vidRef, { orderIndex: index });
      });

      await batch.commit();
      // Overwrite local state immediately for fast UI
      setVideos((prev) => {
        const currentMap = new Map(orderedVideos.map((v, i) => [v.id, i]));
        return prev.map(v => currentMap.has(v.id) ? { ...v, orderIndex: currentMap.get(v.id) } : v).sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
      });
      toast.success("Nuevo orden guardado del servidor.");
    } catch (error) {
      console.log("Error updating order", error);
      toast.error("Ocurrió un error al guardar el orden");
    }
  }

  useEffect(() => {
    getVideos();
  }, []);

  return {
    videos,
    loading,
    getVideos,
    handleDeleteVideo,
    updateVideoOrder
  };
};
