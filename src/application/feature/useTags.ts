import { collection, getDocs } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export type Tag = {
  id: string;
  title: string;
  imageUrl?: string;
};

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  useEffect(() => {
    async function getTags() {
      // try {
      //   const tagsCol = collection(db, "tags");
      //   const tagsSnapshot = await getDocs(tagsCol);
      //   const tagsList: any = tagsSnapshot.docs.map((doc) => ({
      //     ...doc.data(),
      //     id: doc.id,
      //   }));
      //   setTags(tagsList);
      // } catch (error) {}

      // MOCK DATA FOR UI REVIEW
      setTags([
        { id: "DwhhUz1j0t0wi6AnB9ZD", title: "Pre apertura", imageUrl: "/covers/preapertura.png" },
        { id: "RqS0SB2qO0xiueO2tMyS", title: "Guia de básicos", imageUrl: "/covers/guiabasicos.png" },
        { id: "RwRjUhPfUikhrSSM1Yix", title: "Nuestra App", imageUrl: "/covers/nuestraapp.png" },
        { id: "XTfyJZpHTlrk4ywsD5zZ", title: "Codigo Enigma", imageUrl: "/covers/codigoenigma.png" }
      ]);
    }
    getTags();
  }, []);
  return {
    tags,
  };
};
