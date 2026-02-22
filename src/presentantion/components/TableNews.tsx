import * as React from "react";
import {
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
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
import { useNews } from "@app/application/feature/useNews";
import { collection, doc, setDoc } from "firebase/firestore/lite";
import { db } from "@app/application/config/firebase";
import axios from "axios";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import dayjs from "dayjs";
import { FormNews } from "./FormNews";

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
            {/* Top Action Bar */}
            <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                <Typography variant="h6" color="text.secondary">
                    Noticias Recientes
                </Typography>
            </Box>

            {/* Grid of Cards */}
            <Grid container spacing={3}>
                {loading ? (
                    /* Skeleton Loading States */
                    Array.from(new Array(3)).map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{
                                backgroundColor: 'rgba(5, 11, 20, 0.6)',
                                borderRadius: 5,
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <Skeleton variant="rectangular" height={180} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                <CardContent>
                                    <Skeleton width="40%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                    <Skeleton width="100%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mt: 1 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : news.length === 0 ? (
                    /* Empty State */
                    <Grid item xs={12}>
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
                            <NewspaperIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary">No hay noticias publicadas</Typography>
                        </Box>
                    </Grid>
                ) : (
                    /* News Cards ported from Mobile App's NewsCard.js */
                    news.map((item: any) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: '#111827', // Premium sleek dark gray
                                    borderRadius: 4, // 16px
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                                        borderColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                {/* Image Section */}
                                {item.image ? (
                                    <Box sx={{ width: '100%', height: 200, backgroundColor: '#1F2937', position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={item.image}
                                            alt="News Header"
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <Box sx={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }} />
                                    </Box>
                                ) : (
                                    <Box display="flex" justifyContent="center" alignItems="center" height="120" sx={{ backgroundColor: '#1F2937' }}>
                                        <NewspaperIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.05)' }} />
                                    </Box>
                                )}

                                {/* Glassmorphism Actions positioned relative to card instead of image to ensure visibility */}
                                <Box position="absolute" top={10} right={10} display="flex" gap={1}>
                                    <Tooltip title="Editar Noticia">
                                        <IconButton
                                            size="small"
                                            onClick={() => setEditNewsData(item)}
                                            sx={{
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                backdropFilter: 'blur(8px)',
                                                color: '#FFF',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                                            }}
                                        >
                                            <EditOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar Noticia">
                                        <IconButton
                                            size="small"
                                            onClick={() => setDeleteId(item.id)}
                                            sx={{
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                backdropFilter: 'blur(8px)',
                                                color: '#FCA5A5',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                                            }}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                {/* Content Section */}
                                <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                        <Typography sx={{ color: '#9CA3AF', fontSize: 13, fontWeight: 600 }}>
                                            {item.author || "IA 369"}
                                        </Typography>
                                        <Typography sx={{ color: '#6B7280', fontSize: 11, fontWeight: 500 }}>
                                            {formatDate(item.date)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word' }}>
                                        {item.message}
                                    </Typography>
                                </Box>
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
                <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>¿Eliminar Noticia?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Esta acción borrará la noticia de forma permanente del panel principal de los usuarios.
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
