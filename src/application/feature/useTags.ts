import { collection, getDocs } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export type Tag = {
  id: string;
  title: string;
};

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  useEffect(() => {
    async function getTags() {
      try {
        const tagsCol = collection(db, "tags");
        const tagsSnapshot = await getDocs(tagsCol);
        const tagsList: any = tagsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTags(tagsList);
      } catch (error) {}
    }
    getTags();
  }, []);
  return {
    tags,
  };
};
