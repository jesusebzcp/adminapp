import { db } from "@app/application/config/firebase";
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
    TextField,
    Typography,
    useMediaQuery,
    Switch,
    FormControlLabel,
    Divider,
    CircularProgress,
} from "@mui/material";
import PhoneIcon from '@mui/icons-material/Phone';
import {
    addDoc,
    collection,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore/lite";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { UserDirectoryData } from "@app/application/feature/useUsersDirectory";

type FormSubscriptionProps = {
    onClose(): void;
    open: boolean;
    initialData?: UserDirectoryData;
    onRefresh: () => void;
};

export const FormSubscription = ({ onClose, open, initialData, onRefresh }: FormSubscriptionProps) => {
    const matches = useMediaQuery("(min-width:600px)");

    // Determine if we are creating a new user or editing an existing one
    const isEditing = initialData && Object.keys(initialData).length > 0;

    const [values, setValues] = useState({
        email: "",
        name: "",
        phone: "",
        roleStatus: "gratis", // "admin" | "premium" | "gratis"
        signalNotification: true,
        messageNotification: true,
        videoNotification: true,
        endDate: dayjs().add(30, 'day').format("YYYY-MM-DD"),
        newPassword: "", // New state variable
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (isEditing) {
                const isAdmin = initialData.rol === 'admin';
                const isPremium = initialData.endDate && dayjs(initialData.endDate).toDate() > dayjs().toDate();
                const currentRole = isAdmin ? "admin" : (isPremium ? "premium" : "gratis");

                setValues({
                    email: initialData.email || "",
                    name: initialData.name || "",
                    phone: initialData.phone || "",
                    roleStatus: currentRole,
                    signalNotification: initialData.signalNotification ?? true,
                    messageNotification: initialData.messageNotification ?? true,
                    videoNotification: initialData.videoNotification ?? true,
                    endDate: initialData.endDate ? dayjs(initialData.endDate).format("YYYY-MM-DD") : dayjs().add(30, 'day').format("YYYY-MM-DD"),
                    newPassword: "",
                });
            } else {
                setValues({
                    email: "",
                    name: "",
                    phone: "",
                    roleStatus: "gratis",
                    signalNotification: true,
                    messageNotification: true,
                    videoNotification: true,
                    endDate: dayjs().add(30, 'day').format("YYYY-MM-DD"),
                    newPassword: "",
                });
            }
        }
    }, [open, initialData, isEditing]);

    const onChange = (name: string, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async () => {
        if (!values.email || values.email.trim() === "") {
            toast.error("El correo electrónico es obligatorio");
            return;
        }

        try {
            setLoading(true);
            const emailKey = values.email.toLowerCase().trim();
            const firebaseRol = values.roleStatus === 'admin' ? 'admin' : 'user';

            // 1. UPDATE OR CREATE IN `Users` COLLECTION
            if (isEditing && initialData?.id && !initialData.id.startsWith("mock-") && !initialData.id.startsWith("orphan-")) {
                await updateDoc(doc(db, "Users", initialData.id), {
                    rol: firebaseRol,
                    signalNotification: values.signalNotification,
                    messageNotification: values.messageNotification,
                    videoNotification: values.videoNotification,
                });
            } else if (!isEditing) {
                await addDoc(collection(db, "Users"), {
                    email: emailKey,
                    name: values.name,
                    phone: values.phone,
                    rol: firebaseRol,
                    signalNotification: values.signalNotification,
                    messageNotification: values.messageNotification,
                    videoNotification: values.videoNotification,
                    createdAt: new Date(),
                    userId: `manual-${Date.now()}` // Mock auth ID until they sign in
                });
            }

            // 2. UPDATE, CREATE, OR DELETE IN `subscription` COLLECTION
            if (values.roleStatus === 'premium') {
                const subsData = {
                    email: emailKey,
                    endDate: dayjs(values.endDate).toDate(),
                };
                if (isEditing && initialData?.subscriptionId && !initialData.subscriptionId.startsWith("mock-")) {
                    await updateDoc(doc(db, "subscription", initialData.subscriptionId), subsData);
                } else {
                    await addDoc(collection(db, "subscription"), subsData);
                }
            } else if (values.roleStatus === 'gratis' || values.roleStatus === 'admin') {
                // Roles that don't need a strict expiration date restriction
                if (isEditing && initialData?.subscriptionId && !initialData.subscriptionId.startsWith("mock-")) {
                    await deleteDoc(doc(db, "subscription", initialData.subscriptionId));
                }
            }

            // 3. SET OR UPDATE PASSWORD
            if (values.newPassword && values.newPassword.trim() !== "") {
                const response = await fetch("/api/updatePassword", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: emailKey,
                        newPassword: values.newPassword.trim(),
                    }),
                });

                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Error al actualizar la contraseña");
                }
                toast.success("Contraseña actualizada correctamente");
            }

            toast.success(isEditing ? "Perfil CRM actualizado" : "Cliente agregado correctamente");
            onRefresh();
            onClose();
        } catch (error) {
            console.log("error", error);
            toast.error("Ocurrió un error al procesar el perfil CRM");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Dialog open>
                <Typography sx={{ p: 4 }}>{"Procesando actualizaciones del perfil...."}</Typography>
            </Dialog>
        );
    }

    return (
        <Dialog onClose={onClose} open={open} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditing ? "Mantenimiento de Cuenta CRM" : "Crear Nuevo Cliente Manualmente"}</DialogTitle>
            <DialogContent>
                <Box
                    {...(matches && {
                        width: '100%',
                    })}
                    sx={{ mt: 1 }}
                >
                    {/* Identity Block */}
                    {isEditing ? (
                        <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 2, mb: 3 }}>
                            <Typography variant="overline" color="textSecondary">Identidad del Cliente</Typography>
                            <Typography variant="body1" fontWeight="bold">{initialData?.name || "Sin Nombre Registrado"}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>{initialData?.email}</Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} /> {initialData?.phone || "Sin Teléfono"}
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold">Datos del Sistema</Typography>
                            <TextField
                                fullWidth
                                label="Correo Electrónico (Obligatorio)"
                                value={values.email}
                                onChange={(e) => onChange("email", e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Nombre Completo"
                                value={values.name}
                                onChange={(e) => onChange("name", e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Teléfono (WhatsApp)"
                                value={values.phone}
                                onChange={(e) => onChange("phone", e.target.value)}
                            />
                        </Box>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Credenciales de Acceso</Typography>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            label={isEditing ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                            type="password"
                            value={values.newPassword}
                            onChange={(e) => onChange("newPassword", e.target.value)}
                            helperText={isEditing ? "Deja en blanco si no deseas cambiarla. Mínimo 6 caracteres." : "Requerida si deseas que el usuario pueda iniciar sesión con correo y contraseña. Mínimo 6 caracteres."}
                        />
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Suscripción y Privilegios</Typography>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="role-select-label">Rol del Cliente</InputLabel>
                        <Select
                            labelId="role-select-label"
                            value={values.roleStatus}
                            label="Rol del Cliente"
                            onChange={(e: SelectChangeEvent) => onChange("roleStatus", e.target.value)}
                        >
                            <MenuItem value="gratis">Usuario Gratis</MenuItem>
                            <MenuItem value="premium">Usuario Premium</MenuItem>
                            <MenuItem value="admin">Administrador</MenuItem>
                        </Select>
                    </FormControl>

                    {values.roleStatus === 'premium' && (
                        <TextField
                            fullWidth
                            type="date"
                            label="Válido Hasta (Fecha de Vencimiento)"
                            value={values.endDate}
                            onChange={(e) => onChange("endDate", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 3 }}
                        />
                    )}

                    {values.roleStatus === 'admin' && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 3 }}>
                            Nota: Los Administradores tienen acceso perpetuo. Guardar esto eliminará cualquier registro de suscripción anterior y otorgará acceso total a la plataforma.
                        </Typography>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Soporte Técnico (Notificaciones App Móvil)</Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <FormControlLabel
                            control={<Switch checked={values.signalNotification} onChange={(e) => onChange('signalNotification', e.target.checked)} />}
                            label="Notificaciones de Señales"
                        />
                        <FormControlLabel
                            control={<Switch checked={values.messageNotification} onChange={(e) => onChange('messageNotification', e.target.checked)} />}
                            label="Notificaciones de Mensajes"
                        />
                        <FormControlLabel
                            control={<Switch checked={values.videoNotification} onChange={(e) => onChange('videoNotification', e.target.checked)} />}
                            label="Notificaciones de Videos"
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancelar</Button>
                <Button autoFocus variant="contained" onClick={handleFormSubmit}>
                    {isEditing ? "Actualizar Perfil" : "Guardar Nuevo Cliente"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
