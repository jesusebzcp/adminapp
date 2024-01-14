//@ts-ignore
import uuid4 from "uuid4";
import { getDownloadURL, uploadBytes, uploadString } from "firebase/storage";
import { ref } from "firebase/storage";
import { storage } from "../config/firebase";

export const uploadFile = async (file: File | string, path: string) => {
  const storageRef = ref(storage, `${path}/${uuid4()}`);

  typeof file === "string"
    ? await uploadString(storageRef, file.split(",")[1], "base64", {
        contentType: "image/jpeg",
      })
    : await uploadBytes(storageRef, file);
  const fbFileUrl = await getDownloadURL(storageRef);
  return fbFileUrl;
};
