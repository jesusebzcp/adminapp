import * as React from "react";
import {
    Button,
    Typography,
    Box,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Tooltip,
} from "@mui/material";
import { useBanners } from "@app/application/feature/useBanners";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FormBanner } from "./FormBanner";

interface TableBannersProps {
    refreshTrigger: number;
}

export function TableBanners({ refreshTrigger }: TableBannersProps) {
    const { banners, getBanners, loading, onDelete, toggleActive } = useBanners();
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [editBannerData, setEditBannerData] = React.useState<any>(null);

    React.useEffect(() => {
        if (refreshTrigger > 0) {
            getBanners();
        }
    }, [refreshTrigger]);

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, mt: 3, mb: 10 }}>

            {/* Centralized Banners Container */}
            <Box sx={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2 }}>

                {loading ? (
                    /* Skeleton Loading States */
                    Array.from(new Array(2)).map((_, index) => (
                        <Skeleton key={index} variant="rectangular" height={160} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                    ))
                ) : banners.length === 0 ? (
                    /* Empty State */
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
                        <ViewCarouselIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                        <Typography variant="h6" color="textSecondary">No hay banners configurados</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center', maxWidth: 400 }}>
                            Estos banners aparecerán en la pantalla de inicio de la app móvil "Inicia aquí". Puedes usarlos para promociones o anuncios importantes.
                        </Typography>
                    </Box>
                ) : (
                    /* Banners Array */
                    banners.map((item: any) => (
                        <Box
                            key={item.id}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                position: 'relative',
                                filter: item.isActive ? 'none' : 'grayscale(100%) opacity(0.6)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ color: '#F3F4F6', fontSize: 14, fontWeight: 600 }}>
                                    Orden: {item.order} {item.isActive ? '' : '(Inactivo)'}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title={item.isActive ? "Ocultar" : "Mostrar"}>
                                        <IconButton size="small" onClick={() => toggleActive(item.id, item.isActive)} sx={{ color: '#9CA3AF' }}>
                                            {item.isActive ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Editar Banner">
                                        <IconButton size="small" onClick={() => setEditBannerData(item)} sx={{ color: '#9CA3AF' }}>
                                            <EditOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar Banner">
                                        <IconButton size="small" onClick={() => setDeleteId(item.id)} sx={{ color: '#F87171' }}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    component="img"
                                    src={item.imageUrl}
                                    alt="Banner"
                                    sx={{
                                        width: '100%',
                                        maxWidth: 600,
                                        height: 160,
                                        borderRadius: 2,
                                        objectFit: 'cover',
                                        backgroundColor: '#000',
                                    }}
                                />
                            </Box>

                            {item.actionUrl && (
                                <Typography sx={{ color: '#60A5FA', fontSize: 13, mt: 1, wordBreak: 'break-all' }}>
                                    Link: {item.actionUrl}
                                </Typography>
                            )}
                        </Box>
                    ))
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} PaperProps={{ sx: { backgroundColor: '#050B14', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>¿Eliminar Banner?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Esta acción borrará el banner de forma permanente y desaparecerá de la app.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDeleteId(null)} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancelar</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" autoFocus sx={{ borderRadius: 2 }}>
                        Sí, eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Embedded Edit Form */}
            {editBannerData && (
                <FormBanner
                    open={Boolean(editBannerData)}
                    onClose={() => setEditBannerData(null)}
                    initialData={editBannerData}
                    onSuccess={getBanners}
                />
            )}
        </Box>
    );
}
