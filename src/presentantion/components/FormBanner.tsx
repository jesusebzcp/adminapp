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
    Switch,
    FormControlLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import {
    addDoc,
    collection,
    doc,
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

type FormBannerProps = {
    onClose(): void;
    open: boolean;
    onSuccess?: () => void;
    initialData?: typeof initialState & { id?: string; imageUrl?: string };
};

export const initialState = {
    actionUrl: "",
    destinationType: "url", // 'url' or 'screen'
    targetScreen: "", // 'HOME', 'SIGNALS', 'VIDEOS', 'CALCULATOR', 'NEWS'
    order: 0,
    isActive: true,
};

export const FormBanner = ({ onClose, open, initialData, onSuccess }: FormBannerProps) => {
    const [values, setValues] = useState(initialData || initialState);
    const [loading, setLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<File>();

    useEffect(() => {
        if (open) {
            setValues({
                 ...initialState,
                 ...initialData,
                 destinationType: initialData?.targetScreen ? "screen" : "url"
            });
            setImageBase64(undefined);
        }
    }, [open, initialData]);

    const onChange = (name: keyof typeof initialState, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleImagenChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            setImageBase64(file);
        }
    };

    const handleFormSubmit = async () => {
        // Validation
        if (!initialData?.id && !imageBase64) {
             toast("Debes subir una imagen para el nuevo banner.");
             return;
        }

        try {
            setLoading(true);

            const docData: any = {
                actionUrl: values.destinationType === 'url' ? values.actionUrl : "",
                targetScreen: values.destinationType === 'screen' ? values.targetScreen : "",
                destinationType: values.destinationType,
                order: Number(values.order),
                isActive: values.isActive,
            };

            if (imageBase64) {
                docData.imageUrl = await uploadFile(imageBase64, "banners");
            }

            const bannersRef = collection(db, "banners");

            if (initialData?.id) {
                // Edit Mode
                await updateDoc(doc(db, "banners", initialData.id), docData);
                toast("Banner actualizado correctamente");
            } else {
                // Creation Mode
                docData.createdAt = Timestamp.fromDate(new Date());
                await addDoc(bannersRef, docData);
                toast("Banner crado exitosamente");
            }

            if(onSuccess) onSuccess();
            onClose();
            setValues(initialState);
            setImageBase64(undefined);
        } catch (error) {
            console.log("error", error);
            toast("Ocurrió un error al guardar el banner");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Dialog open maxWidth="sm" fullWidth>
                <Typography sx={{ p: 4, textAlign: 'center' }}>{"Guardando banner, por favor espera...."}</Typography>
            </Dialog>
        );
    }

    return (
        <Dialog onClose={onClose} open={open} fullWidth maxWidth="sm">
            <DialogTitle>{initialData?.id ? 'Editar Banner' : 'Añadir Nuevo Banner'}</DialogTitle>
            <DialogContent>
                {imageBase64 ? (
                    <Box display="flex" justifyContent="center" mb={2} mt={1}>
                        <Image
                            width={340}
                            height={160}
                            src={URL.createObjectURL(imageBase64)}
                            alt={"Preview"}
                            style={{ borderRadius: 8, objectFit: 'cover' }}
                        />
                    </Box>
                ) : initialData?.imageUrl ? (
                    <Box display="flex" justifyContent="center" mb={2} mt={1}>
                        <Image
                            width={340}
                            height={160}
                            src={initialData.imageUrl}
                            alt={"Preview"}
                            style={{ borderRadius: 8, objectFit: 'cover' }}
                        />
                    </Box>
                ) : null}
                <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, mb: 2 }}
                >
                    <Button
                        fullWidth
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                    >
                        {imageBase64 || initialData?.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen (Requerido)'}
                        <VisuallyHiddenInput
                            onChange={handleImagenChange}
                            accept="image/*"
                            type={"file"}
                        />
                    </Button>

                    <FormControl fullWidth>
                        <InputLabel id="destination-type-label">Tipo de Acción</InputLabel>
                        <Select
                            labelId="destination-type-label"
                            value={values.destinationType || 'url'}
                            label="Tipo de Acción"
                            onChange={(e) => onChange("destinationType", e.target.value)}
                        >
                            <MenuItem value="url">Abrir Sitio Web (Link Externo)</MenuItem>
                            <MenuItem value="screen">Navegar en la App (Pantalla Interna)</MenuItem>
                        </Select>
                    </FormControl>

                    {values.destinationType === 'url' ? (
                        <TextField
                            fullWidth
                            label="Enlace de acción (URL) Opcional"
                            placeholder="https://pay.hotmart.com/..."
                            value={values.actionUrl}
                            onChange={(e) => onChange("actionUrl", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    ) : (
                        <FormControl fullWidth>
                            <InputLabel id="target-screen-label">Pantalla de la App</InputLabel>
                            <Select
                                labelId="target-screen-label"
                                value={values.targetScreen || ''}
                                label="Pantalla de la App"
                                onChange={(e) => onChange("targetScreen", e.target.value)}
                            >
                                <MenuItem value="">-- Ninguna --</MenuItem>
                                <MenuItem value="HOME">Inicio (Home)</MenuItem>
                                <MenuItem value="SIGNALS">Casos de mercado (Señales)</MenuItem>
                                <MenuItem value="VIDEOS">Inicia Aquí (Videos)</MenuItem>
                                <MenuItem value="CALCULATOR">Calculadora de Riesgo</MenuItem>
                                <MenuItem value="NEWS">Noticias</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        fullWidth
                        label="Orden (Menor es primero)"
                        type="number"
                        value={values.order}
                        onChange={(e) => onChange("order", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={values.isActive}
                                onChange={(e) => onChange("isActive", e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Banner Activo"
                    />

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button autoFocus variant="contained" onClick={handleFormSubmit}>
                    Guardar Banner
                </Button>
            </DialogActions>
        </Dialog>
    );
};
