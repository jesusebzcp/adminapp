import React, { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    InputBase,
    styled,
    Avatar,
    Typography,
    CircularProgress,
    Tooltip
} from "@mui/material";
import { CloudUpload, Send, CloseFullscreen, Close, SmartToy } from "@mui/icons-material";
import { db } from "@app/application/config/firebase";
import { uploadFile } from "@app/application/util/uploadstorage";
import { addDoc, collection, setDoc, doc, Timestamp } from "firebase/firestore/lite";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";

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

type ComposeNewsProps = {
    onSuccess: () => void;
};

export function ComposeNews({ onSuccess }: ComposeNewsProps) {
    const [message, setMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImagenChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleFormSubmit = async () => {
        if (!message.trim() && !imageFile) {
            return;
        }

        try {
            setLoading(true);

            const docData: any = {
                author: "IA 369",
                message: message.trim(),
                date: Timestamp.fromDate(new Date())
            };

            if (imageFile) {
                docData.image = await uploadFile(imageFile, "news");
            }

            const newsRef = collection(db, "Messages");
            const notificationRef = collection(db, "notifications");

            const docCreate = await addDoc(newsRef, docData);
            const finalId = docCreate.id;

            const not = {
                title: `Nueva Noticia de ${docData.author}`,
                body: docData.message.length > 30 ? docData.message.substring(0, 30) + '...' : docData.message,
                topic: "client",
            };

            await axios.post("/api/sendNotification", not);

            await setDoc(doc(notificationRef, finalId), {
                title: not.title,
                body: not.body,
                type: "news",
                date: new Date(),
                id: finalId,
            });

            toast("Noticia publicada exitosamente");
            setMessage("");
            setImageFile(null);
            onSuccess(); // Refresh feed
        } catch (error) {
            console.log("error", error);
            toast("Ocurrió un error al publicar la noticia");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                mb: 4,
                display: 'flex',
                gap: 2,
                p: 2,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
            }}
        >
            <Avatar sx={{ bgcolor: '#1F2937', color: '#9CA3AF', width: 44, height: 44 }}>
                <SmartToy fontSize="small" />
            </Avatar>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <InputBase
                    multiline
                    minRows={1}
                    maxRows={10}
                    placeholder="Escribe una noticia para la comunidad..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{
                        color: '#F3F4F6',
                        fontSize: 16,
                        lineHeight: 1.5,
                        '& .MuiInputBase-input': {
                            padding: '8px 0',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: '#6B7280',
                            opacity: 1
                        }
                    }}
                />

                {imageFile && (
                    <Box sx={{ mt: 2, position: 'relative', display: 'inline-flex' }}>
                        <Image
                            width={150}
                            height={150}
                            src={URL.createObjectURL(imageFile)}
                            alt="Preview"
                            style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                        <IconButton
                            size="small"
                            onClick={() => setImageFile(null)}
                            sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: '#EF4444',
                                color: 'white',
                                '&:hover': { backgroundColor: '#DC2626' }
                            }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                )}

                {/* Bottom Action Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                        <Tooltip title="Adjuntar Imagen">
                            <IconButton component="label" sx={{ color: '#9CA3AF', '&:hover': { color: '#FFF', backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                                <CloudUpload />
                                <VisuallyHiddenInput
                                    onChange={handleImagenChange}
                                    accept="image/*"
                                    type="file"
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Button
                        variant="contained"
                        disabled={loading || (!message.trim() && !imageFile)}
                        onClick={handleFormSubmit}
                        endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                        sx={{
                            backgroundColor: '#3B82F6',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            px: 3,
                            '&:hover': { backgroundColor: '#2563EB' },
                            '&.Mui-disabled': {
                                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                                color: 'rgba(255,255,255,0.3)'
                            }
                        }}
                    >
                        Publicar
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
