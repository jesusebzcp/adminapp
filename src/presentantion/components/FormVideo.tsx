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
  Box
} from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
//@ts-ignore
import VideoThumbnail from "react-video-thumbnail";
import Image from "next/image";
import { useTags } from "@app/application/feature/useTags";
import { collection, doc, setDoc, updateDoc, Timestamp } from "firebase/firestore/lite";
import { db, ref, storage } from "@app/application/config/firebase";
//@ts-ignore
import uuid4 from "uuid4";
import { getDownloadURL, uploadBytes, uploadString } from "firebase/storage";
import { CloudUpload } from "@mui/icons-material";
import axios from "axios";

type FormVideoProps = {
  onClose(): void;
  open: boolean;
  initialTagId?: string | null;
  initialData?: any; // To support editing
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

export const FormVideo = ({ onClose, open, initialTagId, initialData }: FormVideoProps) => {
  const { tags } = useTags();
  const videoRef = useRef<HTMLVideoElement>(null);

  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoLocalUrl, setVideoLocalUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<File | string>("");
  const [selectTag, setSelectTag] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync initialData if it exists
  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setSelectTag(initialData.tag || "");
        setImageBase64(initialData.coverUrl || "");
        // videoFile remains null initially when editing unless they change it
      } else if (initialTagId) {
        setSelectTag(initialTagId);
        setTitle("");
        setDescription("");
        setImageBase64("");
      }
    }
  }, [open, initialTagId, initialData]);

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
    // Only strictly require a new image/video if creating from scratch
    if (!isEditing && !imageBase64) {
      return alert("La portada es obligatoria");
    }
    if (!isEditing && !videoFile) {
      return alert("El archivo de video es obligatorio");
    }
    if (!selectTag) {
      return alert("La categoría es obligatoria");
    }
    try {
      setLoading(true);

      const docData: any = {
        title,
        description,
        tag: selectTag,
      };

      // Upload new video only if selected
      if (videoFile) {
        docData.videoUrl = await uploadFile(videoFile, "videos");
      }

      // Upload new image only if it's a file or a raw base64 string (meaning newly snapped)
      if (imageBase64 && (typeof imageBase64 !== "string" || imageBase64.startsWith("data:video"))) {
        docData.coverUrl = await uploadFile(imageBase64 as string, "images");
      }

      if (isEditing) {
        // Update Mode
        await updateDoc(doc(db, "videos", initialData.id), docData);
      } else {
        // Creation Mode
        docData.create = Timestamp.fromDate(new Date());
        docData.comments = [];
        docData.attachment = [];
        docData.orderIndex = 999999;

        const videosRef = collection(db, "videos");
        await setDoc(doc(videosRef), docData);

        const not = {
          title: "Hola, Tenemos un nuevo video educativo para ti.",
          body: title,
          topic: "client",
        };
        await axios.post("/api/sendNotification", not);
      }

      handleClose();
    } catch (error) {
      console.log("onSubmit:error", error);
      alert("Ocurrió un error al guardar el video");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open>
        <Typography sx={{ p: 4 }}>{isEditing ? "Actualizando video..." : "Cargando video..."}</Typography>
      </Dialog>
    );
  }

  return (
    <Dialog onClose={onClose} open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Editar Video" : "Creador de videos"}</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        {/* Video Upload Area (Optional when editing) */}
        {(!videoFile && !isEditing) ? (
          <div
            {...getRootProps()}
            style={{
              padding: "40px 20px",
              border: "2px dashed rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              backgroundColor: "rgba(5, 11, 20, 0.4)",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Arrastra y suelta un archivo de video aquí, o haz clic para seleccionarlo.
            </p>
          </div>
        ) : (
          <Box>
            {videoFile && (
              <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mb: 1 }}>
                Nuevo archivo de video cargado!
              </Typography>
            )}
            {isEditing && !videoFile && (
              <Box
                {...getRootProps()}
                sx={{
                  padding: "20px",
                  border: "1px dashed rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  textAlign: "center",
                  cursor: "pointer",
                  mb: 2
                }}
              >
                <input {...getInputProps()} />
                <Typography variant="body2" color="textSecondary">Haga clic aquí si desea reemplazar el archivo de video actual (.mp4)</Typography>
              </Box>
            )}

            <div style={{ display: "none" }}>
              {(videoLocalUrl || typeof imageBase64 === "string" && imageBase64.startsWith("data:video")) && (
                <VideoThumbnail
                  videoUrl={videoLocalUrl}
                  thumbnailHandler={(thumbnail: string) => {
                    // Don't overwrite existing cover if we are just editing text and haven't uploaded a new vid
                    if (!isEditing || videoFile) {
                      setImageBase64(thumbnail);
                    }
                  }}
                  snapshotAtTime={5}
                  width={1280}
                  height={720}
                />
              )}
            </div>

            {imageBase64 && (
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0, right: 0, left: 0, bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10
                  }}
                >
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUpload />}
                    sx={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
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
                  style={{ borderRadius: 12, objectFit: 'cover' }}
                  src={
                    typeof imageBase64 === "string"
                      ? imageBase64
                      : URL.createObjectURL(imageBase64 as any)
                  }
                  width={550}
                  height={200}
                  alt={"Portada de video"}
                />
              </div>
            )}
          </Box>
        )}

        {videoDuration && (
          <Typography variant="caption" color="textSecondary">Duración del Video: {Math.round(videoDuration)} segundos</Typography>
        )}

        {/* Text Fields */}
        {(!initialTagId || isEditing) && (
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Categoría</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectTag}
              label="Categoría"
              onChange={handleChange}
            >
              {tags && tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          label="Título del Video"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label="Descripción Extendida"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancelar</Button>
        <Button onClick={onSubmit} autoFocus variant="contained">
          {isEditing ? "Guardar Cambios" : "Crear Video"}
        </Button>
      </DialogActions>
      <video ref={videoRef} style={{ display: "none" }} preload="metadata" />
    </Dialog>
  );
};
