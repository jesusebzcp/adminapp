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
    Avatar
} from "@mui/material";
import { useNews } from "@app/application/feature/useNews";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import dayjs from "dayjs";
import { FormNews } from "./FormNews";
import { ComposeNews } from "./ComposeNews";

export function TableNews() {
    const { news, getNews, loading, onDelete } = useNews();
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const [editNewsData, setEditNewsData] = React.useState<any>(null);

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    const formatDate = (dateObj: any) => {
        if (!dateObj) return "";
        if (dateObj.seconds) return dayjs(dateObj.seconds * 1000).format('DD/MM/YYYY hh:mm A');
        return dayjs(dateObj).format('DD/MM/YYYY hh:mm A');
    };

    return (
        <Box sx={{ flexGrow: 1, mt: 3, mb: 10 }}>

            {/* Centralized Discord-style Feed Container */}
            <Box sx={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 1 }}>

                {/* Inline Creation Input */}
                <ComposeNews onSuccess={getNews} />

                {loading ? (
                    /* Skeleton Loading States */
                    Array.from(new Array(3)).map((_, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, p: 2 }}>
                            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton width="30%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 1 }} />
                                <Skeleton width="90%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 0.5 }} />
                                <Skeleton width="75%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                <Skeleton variant="rectangular" height={200} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mt: 2, borderRadius: 2 }} />
                            </Box>
                        </Box>
                    ))
                ) : news.length === 0 ? (
                    /* Empty State */
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
                        <NewspaperIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                        <Typography variant="h6" color="textSecondary">No hay noticias publicadas</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center', maxWidth: 400 }}>
                            Este será tu canal principal de comunicación. Las noticias que publiques aparecerán aquí estilo &quot;feed&quot; y notificarán a los usuarios.
                        </Typography>
                    </Box>
                ) : (
                    /* News "Feed" Array */
                    news.map((item: any) => (
                        <Box
                            key={item.id}
                            sx={{
                                display: 'flex',
                                gap: 2,
                                p: 2,
                                borderRadius: 2,
                                transition: 'background-color 0.2s ease',
                                position: 'relative',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    '& .action-buttons': { opacity: 1, transform: 'scale(1)' }
                                }
                            }}
                        >
                            {/* Avatar Section */}
                            <Avatar sx={{ bgcolor: '#1F2937', color: '#9CA3AF', width: 44, height: 44 }}>
                                {item.author?.toLowerCase().includes("ia") ? (
                                    <SmartToyIcon fontSize="small" />
                                ) : (
                                    <Typography sx={{ fontWeight: 'bold' }}>
                                        {item.author ? item.author.charAt(0).toUpperCase() : 'A'}
                                    </Typography>
                                )}
                            </Avatar>

                            {/* Message Content Section */}
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* Header: Author & Timestamp */}
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 0.5 }}>
                                    <Typography sx={{ color: '#F3F4F6', fontSize: 16, fontWeight: 600 }}>
                                        {item.author || "IA 369"}
                                    </Typography>
                                    <Typography sx={{ color: '#6B7280', fontSize: 12, fontWeight: 500 }}>
                                        {formatDate(item.date)}
                                    </Typography>
                                </Box>

                                {/* Message Body: Preserving linebreaks */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#D1D5DB',
                                        lineHeight: 1.6,
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-wrap', // Keeps the paragraphs intact like Discord
                                        fontSize: 15
                                    }}
                                >
                                    {item.message}
                                </Typography>

                                {/* Media Attachment (Discord style) */}
                                {item.image && (
                                    <Box sx={{ mt: 1.5, display: 'flex' }}>
                                        <Box
                                            component="img"
                                            src={item.image}
                                            alt="News attachment"
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: 400,
                                                borderRadius: 2,
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                objectFit: 'contain',
                                                backgroundColor: '#0A0F1A' // dark backdrop inside the container
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* Floating Action Buttons (Hidden until hover on Desktop, static on Mobile) */}
                            <Box
                                className="action-buttons"
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    opacity: { xs: 1, md: 0 },
                                    transform: { xs: 'scale(1)', md: 'scale(0.95)' },
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    gap: 0.5,
                                    backgroundColor: 'rgba(17, 24, 39, 0.8)', // Slight blur background
                                    backdropFilter: 'blur(4px)',
                                    borderRadius: 1,
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    padding: '2px'
                                }}
                            >
                                <Tooltip title="Editar Noticia">
                                    <IconButton
                                        size="small"
                                        onClick={() => setEditNewsData(item)}
                                        sx={{ color: '#9CA3AF', '&:hover': { color: '#FFF', backgroundColor: 'rgba(255,255,255,0.1)' } }}
                                    >
                                        <EditOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar Noticia">
                                    <IconButton
                                        size="small"
                                        onClick={() => setDeleteId(item.id)}
                                        sx={{ color: '#9CA3AF', '&:hover': { color: '#F87171', backgroundColor: 'rgba(248, 113, 113, 0.1)' } }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                PaperProps={{
                    sx: { backgroundColor: '#050B14', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }
                }}
            >
                <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>¿Eliminar Noticia?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Esta acción borrará la noticia de forma permanente del feed de los usuarios.
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
            {editNewsData && (
                <FormNews
                    open={Boolean(editNewsData)}
                    onClose={() => setEditNewsData(null)}
                    initialData={editNewsData}
                />
            )}
        </Box>
    );
}
