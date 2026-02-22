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
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Chip
} from "@mui/material";
import { useVideos, VideoDocument } from "@app/application/feature/useVideos";
import { useTags, Tag } from "@app/application/feature/useTags";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormVideo } from "./FormVideo";

// We accept a setCategory prop so we can inform the parent page (index.tsx)
// which category is open. That way "Cargar Video" knows where we are.
export function TableVideos({ onFolderChange }: { onFolderChange: (categoryId: string | null) => void }) {
  const { videos, loading, getVideos, handleDeleteVideo } = useVideos();
  const { tags } = useTags();

  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);
  const [editVideoData, setEditVideoData] = React.useState<any>(null);

  React.useEffect(() => {
    // Notify the parent component when the folder changes
    onFolderChange(selectedFolderId);
  }, [selectedFolderId, onFolderChange]);

  const confirmDelete = () => {
    if (deleteId) {
      handleDeleteVideo(deleteId);
      setDeleteId(null);
    }
  };

  const getCategoryName = (tagId?: string) => {
    if (!tagId) return "Sin Categoría";
    const found = tags.find((t) => t.id === tagId);
    return found ? found.title : tagId;
  };

  // Filter videos based on the active folder
  const filteredVideos = selectedFolderId
    ? videos.filter(v => v.tag === selectedFolderId)
    : videos;

  // Render the Folder navigation view
  if (!selectedFolderId) {
    return (
      <Box sx={{ flexGrow: 1, mt: 3, mb: 10 }}>
        <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
          <Typography variant="h6" color="text.secondary">
            Carpetas de Videos
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={`skeleton-folder-${index}`}>
                <Skeleton variant="rounded" height={140} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
              </Grid>
            ))
          ) : (
            tags.map((tag: Tag) => {
              const videoCount = videos.filter(v => v.tag === tag.id).length;
              return (
                <Grid item xs={12} sm={6} md={3} key={tag.id}>
                  <Card
                    onClick={() => setSelectedFolderId(tag.id)}
                    sx={{
                      height: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#050B14',
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                        border: '1px solid rgba(0, 82, 204, 0.5)',
                        '& .cover-img': { opacity: 0.9, transform: 'scale(1.05)' }
                      }
                    }}
                  >
                    {tag.imageUrl && (
                      <CardMedia
                        className="cover-img"
                        component="img"
                        image={tag.imageUrl}
                        alt={tag.title}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          height: '100%',
                          width: '100%',
                          objectFit: 'cover',
                          opacity: 0.6,
                          transition: 'all 0.4s ease-in-out'
                        }}
                      />
                    )}

                    {/* Smooth Gradient Overlay for text readability */}
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,11,20,0.95) 0%, rgba(5,11,20,0.2) 100%)' }} />

                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ position: 'relative', zIndex: 1, p: 2, width: '100%', textAlign: 'left' }}>
                      {!tag.imageUrl && <FolderIcon sx={{ fontSize: 32, color: '#0052cc', mb: 1 }} />}
                      <Typography variant="h6" sx={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {tag.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>
    );
  }

  // Render the specific videos inside a selected folder
  const currentFolderName = getCategoryName(selectedFolderId);

  return (
    <Box sx={{ flexGrow: 1, mt: 3, mb: 10 }}>
      {/* Top Action Bar for Inside Folder */}
      <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={() => setSelectedFolderId(null)}
            sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon sx={{ color: '#0052cc' }} />
            {currentFolderName}
          </Typography>
        </Box>
      </Box>

      {/* Grid of Video Cards within the folder */}
      <Grid container spacing={3}>
        {loading ? (
          /* Skeleton Loading States */
          Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{
                backgroundColor: 'rgba(5, 11, 20, 0.6)',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <Skeleton variant="rectangular" height={200} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <CardContent>
                  <Skeleton width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <Skeleton width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : filteredVideos.length === 0 ? (
          /* Empty State */
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
              <FolderIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">Esta carpeta está vacía</Typography>
            </Box>
          </Grid>
        ) : (
          /* Video Cards */
          filteredVideos.map((video: VideoDocument) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
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
                <CardMedia
                  component="img"
                  height="200"
                  image={video.coverUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113"}
                  alt={video.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.2 }}>
                    {video.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {video.description}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title={`${video.comments?.length || 0} Comentarios`}>
                      <Badge badgeContent={video.comments?.length || 0} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#0052cc' } }}>
                        <ChatBubbleOutlineIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                      </Badge>
                    </Tooltip>
                  </Box>
                </CardContent>
                <CardActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between', px: 2, pb: 2, pt: 1.5 }}>
                  <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setEditVideoData(video)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Editar
                  </Button>
                  <Tooltip title="Eliminar Video">
                    <IconButton size="small" color="error" onClick={() => setDeleteId(video.id)}>
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
        <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>¿Eliminar video?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Esta acción no se puede deshacer. El video se borrará permanentemente de la plataforma.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancelar</Button>
          <Button onClick={confirmDelete} variant="contained" color="error" autoFocus sx={{ borderRadius: 2 }}>
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dynamic Video Editor Model */}
      {editVideoData && (
        <FormVideo
          open={Boolean(editVideoData)}
          onClose={() => {
            setEditVideoData(null);
            getVideos();
          }}
          initialData={editVideoData}
        />
      )}
    </Box>
  );
}
