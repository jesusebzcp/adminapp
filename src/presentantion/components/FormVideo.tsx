import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
//@ts-ignore
import VideoThumbnail from "react-video-thumbnail";
import Image from "next/image";
import { useTags } from "@app/application/feature/useTags";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore/lite";
import { db, ref, storage } from "@app/application/config/firebase";
//@ts-ignore
import uuid4 from "uuid4";
import { getDownloadURL, uploadBytes, uploadString } from "firebase/storage";
import { CloudUpload } from "@mui/icons-material";
import axios from "axios";

type FormVideoProps = {
  onClose(): void;
  open: boolean;
};
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const FormVideo = ({ onClose, open }: FormVideoProps) => {
  const { tags } = useTags();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoLocalUrl, setVideoLocalUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<File | string>("");
  const [selectTag, setSelectTag] = useState("");
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setVideoFile(file);
    if (file && videoRef.current) {
      const videoObjectURL = URL.createObjectURL(file);
      setVideoLocalUrl(videoObjectURL);
      videoRef.current.src = videoObjectURL;

      videoRef.current.addEventListener("loadedmetadata", () => {
        if (typeof videoRef.current?.duration === "number") {
          setVideoDuration(videoRef?.current?.duration);
        }
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4", ".MP4"],
    },
  });

  const handleImagenChange = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      setImageBase64(file);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSelectTag(event.target.value as string);
  };
  const uploadFile = async (file: File | string, path: string) => {
    const storageRef = ref(storage, `${path}/${uuid4()}`);

    typeof file === "string"
      ? await uploadString(storageRef, file.split(",")[1], "base64", {
          contentType: "image/jpeg",
        })
      : await uploadBytes(storageRef, file);
    const fbFileUrl = await getDownloadURL(storageRef);
    return fbFileUrl;
  };

  const handleClose = () => {
    setSelectTag("");
    setImageBase64("");
    setVideoFile(null);
    setVideoLocalUrl(null);
    setVideoLocalUrl(null);
    setVideoDuration(null);
    setDescription("");
    setTitle("");
    onClose();
  };

  const onSubmit = async () => {
    if (!title.trim()) {
      return alert("El titulo es obligatorio");
    }
    if (!description.trim()) {
      return alert("La descripción es obligatorio");
    }
    if (!imageBase64) {
      return alert("La portada es obligatoria");
    }
    if (!selectTag) {
      return alert("La categoría es obligatoria");
    }
    try {
      setLoading(true);
      const docData = {
        title,
        description,
        create: Timestamp.fromDate(new Date()),
        comments: [],
        attachment: [],
        videoUrl: await uploadFile(videoFile as File, "videos"),
        coverUrl: await uploadFile(imageBase64 as string, "images"),
        tag: selectTag,
      };
      const citiesRef = collection(db, "videos");
      await setDoc(doc(citiesRef), docData);
      const not = {
        title: "Hola, Tenemos un nuevo video para ti.",
        body: "",
        topic: "client",
      };
      await axios.post("/api/sendNotification", not);
      handleClose();
    } catch (error) {
      console.log("onSubmit:error", error);
      alert("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Dialog open>
        <Typography>{"Cargando...."}</Typography>
      </Dialog>
    );
  }
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Creador de videos</DialogTitle>
      {videoFile ? (
        <DialogContent>
          <div style={{ display: "none" }}>
            <VideoThumbnail
              videoUrl={videoLocalUrl}
              thumbnailHandler={(thumbnail: string) =>
                setImageBase64(thumbnail)
              }
              snapshotAtTime={5}
              width={1280}
              height={720}
            />
          </div>
          {imageBase64 && (
            <div
              style={{
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUpload />}
                >
                  Cambiar portada
                  <VisuallyHiddenInput
                    onChange={handleImagenChange}
                    accept="image/*"
                    type={"file"}
                  />
                </Button>
              </div>
              <Image
                style={{
                  borderRadius: 12,
                }}
                src={
                  typeof imageBase64 === "string"
                    ? imageBase64
                    : URL.createObjectURL(imageBase64)
                }
                width={550}
                height={200}
                alt={""}
              />
            </div>
          )}
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Seleccione categoría
            </InputLabel>

            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectTag}
              label="Seleccione categoría"
              onChange={handleChange}
            >
              {tags &&
                tags.length > 0 &&
                tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label="Título"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {videoDuration && (
            <p>Duración del Video: {Math.round(videoDuration)} segundos</p>
          )}
        </DialogContent>
      ) : (
        <DialogContent>
          <div
            {...getRootProps()}
            style={{
              margin: "20px 0",
              padding: "20px",
              border: "2px dashed #ccc",
            }}
          >
            <input {...getInputProps()} />
            <p>
              Arrastra y suelta un archivo de video aquí, o haz clic para
              seleccionar uno.
            </p>
          </div>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onSubmit} autoFocus variant="contained">
          Continuar
        </Button>
      </DialogActions>
      <video ref={videoRef} style={{ display: "none" }} preload="metadata" />
    </Dialog>
  );
};
