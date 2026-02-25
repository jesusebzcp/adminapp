import { db } from "@app/application/config/firebase";
import { uploadFile } from "@app/application/util/uploadstorage";
import { CloudUpload } from "@mui/icons-material";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    styled,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import axios from "axios";
import {
    addDoc,
    collection,
    doc,
    setDoc,
    updateDoc,
    Timestamp,
} from "firebase/firestore/lite";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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

type FormNewsProps = {
    onClose(): void;
    open: boolean;
    initialData?: typeof initialState & { id?: string; image?: string; graphImage?: string };
};

export const initialState = {
    author: "IA 369",
    message: "",
};

export const FormNews = ({ onClose, open, initialData }: FormNewsProps) => {
    const matches = useMediaQuery("(min-width:600px)");
    const [values, setValues] = useState(initialData || initialState);
    const [loading, setLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<File>();

    // UseEffect to reset or pre-fill form when opened
    useEffect(() => {
        if (open) {
            setValues(initialData || initialState);
            setImageBase64(undefined);
        }
    }, [open, initialData]);

    const onChange = (name: keyof typeof initialState, value: string) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        return values.author.trim() !== "" && values.message.trim() !== "";
    };

    const handleImagenChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            setImageBase64(file);
        }
    };

    const handleFormSubmit = async () => {
        if (!validateForm()) {
            toast("Por favor, complete todos los campos obligatorios.");
            return;
        }
        // For News, image might be optional, but usually preferred. Let's make it optional.

        try {
            setLoading(true);

            const docData: any = {
                author: values.author,
                message: values.message,
            };

            // Only parse new image if uploaded. Note: mobile app sometimes uses 'image'
            if (imageBase64) {
                docData.image = await uploadFile(imageBase64, "news");
            }

            const newsRef = collection(db, "Messages");
            const notificationRef = collection(db, "notifications");

            let finalId = "";
            if (initialData?.id) {
                // Edit Mode
                await updateDoc(doc(db, "Messages", initialData.id), docData);
                finalId = initialData.id;
                toast("Noticia actualizada correctamente");
            } else {
                // Creation Mode
                docData.date = Timestamp.fromDate(new Date());
                const docCreate = await addDoc(newsRef, docData);
                finalId = docCreate.id;
                toast("Noticia publicada exitosamente");
            }

            // If we are creating, send notification to client topic
            if (!initialData?.id) {
                const not: any = {
                    title: `Nueva Noticia de ${docData.author}`,
                    body: docData.message.length > 30 ? docData.message.substring(0, 30) + '...' : docData.message,
                    topic: "client",
                    type: "news",
                };
                // Fire Push Notification to Native Apps
                await axios.post("/api/sendNotification", not);

                // Save Notification Log so mobile NotificationView marks it as unread
                await setDoc(doc(notificationRef, finalId), {
                    title: not.title,
                    body: not.body,
                    type: "news", // Critical for Mobile Deep Linking
                    date: new Date(),
                    id: finalId,
                });
            }

            onClose();
            setValues(initialState);
            setImageBase64(undefined);
        } catch (error) {
            console.log("error", error);
            toast("Ocurrió un error al procesar la noticia");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Dialog open>
                <Typography sx={{ p: 4 }}>{"Cargando...."}</Typography>
            </Dialog>
        );
    }

    return (
        <Dialog onClose={onClose} open={open} fullWidth maxWidth="sm">
            <DialogTitle>{initialData?.id ? 'Editar Noticia' : 'Publicar Nueva Noticia'}</DialogTitle>
            <DialogContent>
                {imageBase64 ? (
                    <Box display="flex" justifyContent="center" mb={2} mt={1}>
                        <Image
                            width={300}
                            height={200}
                            src={URL.createObjectURL(imageBase64)}
                            alt={"Preview"}
                            style={{ borderRadius: 8, objectFit: 'cover' }}
                        />
                    </Box>
                ) : initialData?.image ? (
                    <Box display="flex" justifyContent="center" mb={2} mt={1}>
                        <Image
                            width={300}
                            height={200}
                            src={initialData.image}
                            alt={"Preview"}
                            style={{ borderRadius: 8, objectFit: 'cover' }}
                        />
                    </Box>
                ) : null}
                <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, mb: 2 }}
                >
                    <TextField
                        fullWidth
                        label="Autor"
                        value={values.author}
                        onChange={(e) => onChange("author", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        fullWidth
                        label="Mensaje de la noticia"
                        value={values.message}
                        onChange={(e) => onChange("message", e.target.value)}
                        multiline
                        rows={5}
                        InputLabelProps={{ shrink: true }}
                        placeholder="Escribe el cuerpo completo de la noticia aquí..."
                    />

                    <Button
                        fullWidth
                        component="label"
                        variant="contained"
                        startIcon={<CloudUpload />}
                        sx={{ mb: 2 }}
                    >
                        {imageBase64 || initialData?.image ? 'Cambiar Imagen' : 'Subir Imagen'}
                        <VisuallyHiddenInput
                            onChange={handleImagenChange}
                            accept="image/*"
                            type={"file"}
                        />
                    </Button>

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button autoFocus variant="contained" onClick={handleFormSubmit}>
                    Publicar Noticia
                </Button>
            </DialogActions>
        </Dialog>
    );
};
