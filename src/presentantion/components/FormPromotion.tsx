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
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    styled,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { addDoc, collection, doc, updateDoc, Timestamp } from "firebase/firestore/lite";
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

type FormPromotionProps = {
    onClose(): void;
    open: boolean;
    editData?: any;
};

const frequencyOptions = [
    { key: "once", label: "Una vez" },
    { key: "daily", label: "Diario" },
    { key: "weekly", label: "Semanal" },
    { key: "always", label: "Cada inicio" },
];

export const initialState = {
    redirectUrl: "",
    frequencyType: "once",
    targetAudience: "all",
    active: true,
};

export const FormPromotion = ({ onClose, open, editData }: FormPromotionProps) => {
    const matches = useMediaQuery("(min-width:600px)");
    const [values, setValues] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<File | string | undefined>();

    useEffect(() => {
        if (editData) {
            setValues({
                redirectUrl: editData.redirectUrl || "",
                frequencyType: editData.frequencyType || "once",
                targetAudience: editData.targetAudience || "all",
                active: editData.active,
            });
            setImageBase64(editData.imageUrl);
        } else {
            setValues(initialState);
            setImageBase64(undefined);
        }
    }, [editData, open]);

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
        if (!imageBase64) {
            return toast("La imagen es obligatoria");
        }

        try {
            setLoading(true);

            let finalImageUrl = imageBase64;
            if (typeof imageBase64 !== "string") {
                // Only upload if it's a new file, not a pre-existing URL string
                finalImageUrl = await uploadFile(imageBase64, "promotions");
            }

            const docData = {
                redirectUrl: values.redirectUrl.trim() || null,
                frequencyType: values.frequencyType,
                targetAudience: values.targetAudience,
                imageUrl: finalImageUrl,
                active: values.active,
            };

            if (editData?.id) {
                // Update
                await updateDoc(doc(db, "Promotions", editData.id), docData);
                toast.success("Promoción actualizada con éxito");
            } else {
                // Create
                const newPromo = {
                    ...docData,
                    createdAt: Timestamp.fromDate(new Date())
                };
                await addDoc(collection(db, "Promotions"), newPromo);
                toast.success("Promoción creada con éxito");
            }

            onClose();
            setValues(initialState);
            setImageBase64(undefined);
        } catch (error) {
            console.log("error", error);
            toast.error("Ocurrió un error al guardar la promoción");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Dialog open>
                <DialogContent>
                    <Typography>{"Guardando..."}</Typography>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog onClose={onClose} open={open} maxWidth="sm" fullWidth>
            <DialogTitle>{editData ? "Editar Promoción" : "Nueva Promoción"}</DialogTitle>
            <DialogContent>
                <Box
                    {...(matches && {
                        width: 500,
                    })}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
                >
                    {imageBase64 && (
                        <Box mb={2} display="flex" justifyContent="center">
                            <Image
                                width={300}
                                height={400}
                                objectFit="contain"
                                src={typeof imageBase64 === "string" ? imageBase64 : URL.createObjectURL(imageBase64)}
                                alt={"Preview"}
                                style={{ borderRadius: 8 }}
                            />
                        </Box>
                    )}

                    <Button
                        fullWidth
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        sx={{ mb: 2 }}
                    >
                        {imageBase64 ? "Cambiar Imagen" : "Seleccionar Imagen"}
                        <VisuallyHiddenInput
                            onChange={handleImagenChange}
                            accept="image/*"
                            type={"file"}
                        />
                    </Button>

                    <TextField
                        fullWidth
                        label="Enlace de Redirección (Opcional)"
                        placeholder="https://wa.me/..."
                        value={values.redirectUrl}
                        onChange={(e) => onChange("redirectUrl", e.target.value)}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="frequency-label">Frecuencia</InputLabel>
                        <Select
                            labelId="frequency-label"
                            value={values.frequencyType}
                            label="Frecuencia"
                            onChange={(e: SelectChangeEvent) => onChange("frequencyType", e.target.value)}
                        >
                            {frequencyOptions.map((opt) => (
                                <MenuItem key={opt.key} value={opt.key}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="audience-label">Público Objetivo</InputLabel>
                        <Select
                            labelId="audience-label"
                            value={values.targetAudience}
                            label="Público Objetivo"
                            onChange={(e: SelectChangeEvent) => onChange("targetAudience", e.target.value)}
                        >
                            <MenuItem value="all">Todos los Usuarios</MenuItem>
                            <MenuItem value="free">Solo Usuarios Gratis (Membresía Vencida)</MenuItem>
                            <MenuItem value="premium">Solo Usuarios VIP / Premium</MenuItem>
                            <MenuItem value="admin">Solo Administradores</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="status-label">Estado</InputLabel>
                        <Select
                            labelId="status-label"
                            value={values.active ? "Activa" : "Inactiva"}
                            label="Estado"
                            onChange={(e: SelectChangeEvent) => onChange("active", e.target.value === "Activa")}
                        >
                            <MenuItem value="Activa">Activa</MenuItem>
                            <MenuItem value="Inactiva">Inactiva</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button autoFocus variant="contained" onClick={handleFormSubmit}>
                    {editData ? "Actualizar" : "Publicar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
