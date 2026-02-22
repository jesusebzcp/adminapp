import * as React from "react";
import {
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Box,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions as MuiDialogActions,
    IconButton,
    Tooltip,
    Switch,
    Chip
} from "@mui/material";
import { usePromotions } from "@app/application/feature/usePromotions";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LinkIcon from '@mui/icons-material/Link';
import Image from "next/image";
import { updateDoc, doc } from "firebase/firestore/lite";
import { db } from "@app/application/config/firebase";
import { toast } from "sonner";

export function TablePromotions({ onEdit }: { onEdit: (promo: any) => void }) {
    const { promotions, loading, getPromotions, onDelete } = usePromotions();
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [deleteImageUrl, setDeleteImageUrl] = React.useState<string>("");

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "Promotions", id), {
                active: !currentStatus,
            });
            getPromotions();
            toast.success("Estado de promoción actualizado");
        } catch (error) {
            toast.error("Ocurrió un error al actualizar la promoción");
        }
    };

    const translateFrequency = (freq: string) => {
        switch (freq) {
            case 'daily': return 'Diario';
            case 'weekly': return 'Semanal';
            case 'always': return 'Cada inicio';
            default: return 'Una sola vez';
        }
    };

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId, deleteImageUrl);
            setDeleteId(null);
            setDeleteImageUrl("");
        }
    };

    const openDeleteDialog = (id: string, url: string) => {
        setDeleteId(id);
        setDeleteImageUrl(url || "");
    };

    return (
        <Box sx={{ flexGrow: 1, mt: 3, mb: 10 }}>
            {/* Top Action Bar  -- Intentionally left empty since Recargar was removed. Keeping Box for spacing if needed later, or we could remove block entirely*/}
            <Box display="flex" justifyContent="flex-end" mb={3}>
            </Box>

            {/* Grid of Modular Cards */}
            <Grid container spacing={3}>
                {loading ? (
                    /* Skeleton Loading States */
                    Array.from(new Array(3)).map((_, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card sx={{
                                backgroundColor: 'rgba(5, 11, 20, 0.6)',
                                borderRadius: 4,
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <Skeleton variant="rectangular" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                <CardContent>
                                    <Skeleton width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : promotions.length === 0 ? (
                    /* Empty State */
                    <Grid item xs={12}>
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
                            <Typography variant="h6" color="textSecondary">No hay promociones disponibles</Typography>
                        </Box>
                    </Grid>
                ) : (
                    /* Promotion Cards */
                    promotions.map((promo: any) => (
                        <Grid item xs={12} sm={6} md={3} key={promo.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: 'rgba(5, 11, 20, 0.8)',
                                    borderRadius: 4,
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)'
                                    }
                                }}
                            >
                                {/* Status Badge */}
                                <Box position="absolute" top={10} right={10} zIndex={1}>
                                    <Chip
                                        label={promo.active ? "Activa" : "Inactiva"}
                                        color={promo.active ? "success" : "default"}
                                        size="small"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>

                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={promo.imageUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113"}
                                    alt="Promotion Cover"
                                    sx={{ objectFit: 'cover' }}
                                />

                                <CardContent sx={{ flexGrow: 1, pb: 1, pt: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, mt: 1 }}>
                                        <strong>Frecuencia:</strong> {translateFrequency(promo.frequencyType)}
                                    </Typography>

                                    {promo.redirectUrl && (
                                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                                            <LinkIcon fontSize="small" sx={{ color: '#0052cc' }} />
                                            <Typography variant="body2" sx={{ color: '#0052cc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <a href={promo.redirectUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    Enlace adjunto
                                                </a>
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>
                                            Visibilidad:
                                        </Typography>
                                        <Tooltip title={promo.active ? "Apagar Promo" : "Encender Promo"}>
                                            <Switch
                                                size="small"
                                                checked={promo.active}
                                                onChange={() => toggleActive(promo.id, promo.active)}
                                                color="success"
                                            />
                                        </Tooltip>
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between', px: 2, pb: 2, pt: 1.5 }}>
                                    <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => onEdit(promo)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        Editar
                                    </Button>
                                    <Tooltip title="Eliminar Promoción">
                                        <IconButton size="small" color="error" onClick={() => openDeleteDialog(promo.id, promo.imageUrl)}>
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                PaperProps={{
                    sx: { backgroundColor: '#050B14', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }
                }}
            >
                <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>¿Eliminar Promoción?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Esta acción no se puede deshacer. La imagen y los datos de la promoción se borrarán de la base de datos.
                    </DialogContentText>
                </DialogContent>
                <MuiDialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDeleteId(null)} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancelar</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" autoFocus sx={{ borderRadius: 2 }}>
                        Sí, eliminar
                    </Button>
                </MuiDialogActions>
            </Dialog>
        </Box>
    );
}
