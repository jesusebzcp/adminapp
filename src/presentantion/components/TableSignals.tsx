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
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from "@mui/material";
import { useSignals } from "@app/application/feature/useSignals";
import { typeStatus } from "./FormSignal";
import { collection, doc, setDoc, updateDoc } from "firebase/firestore/lite";
import { db } from "@app/application/config/firebase";
import axios from "axios";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import dayjs from "dayjs";
import { FormSignal } from "./FormSignal";

export function TableSignals() {
  const { signals, getSignals, loading, onDelete } = useSignals();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [editSignalData, setEditSignalData] = React.useState<any>(null);

  const onChangeStatus = async (status: string, signal: any) => {
    try {
      await updateDoc(doc(db, "Signals", signal.id), {
        status: status,
      });
      const titleSymbol = signal.currency ? `${signal.defaultCurrency}/${signal.currency}` : signal.defaultCurrency;
      const not = {
        title: "Hola 👋",
        body: `Análisis actualizado ${titleSymbol}`,
        topic: "client",
      };
      const notificationRef = collection(db, "notifications");

      await axios.post("/api/sendNotification", not);
      await setDoc(doc(notificationRef), {
        title: not.title,
        body: not.body,
        type: "signal",
        date: new Date(),
        id: signal.id,
      });
      getSignals();
    } catch (error) {
      alert("Ocurrió un error al actualizar la señal");
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return "";
    if (dateObj.seconds) return dayjs(dateObj.seconds * 1000).format('DD/MM/YYYY');
    return dayjs(dateObj).format('DD/MM/YYYY');
  };

  return (
    <Box sx={{ flexGrow: 1, mt: 3, mb: 10 }}>
      {/* Top Action Bar */}
      <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
        <Typography variant="h6" color="text.secondary">
          Señales / Operaciones
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
                borderRadius: 5, // ~20px
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <Skeleton variant="rectangular" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Skeleton variant="rectangular" height={180} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                <CardContent>
                  <Skeleton width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : signals.length === 0 ? (
          /* Empty State */
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
              <ShowChartIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">No hay señales disponibles</Typography>
            </Box>
          </Grid>
        ) : (
          /* Signal Cards ported exactly from SignalCard.js Mobile */
          signals.map((signal: any) => (
            <Grid item xs={12} sm={6} md={4} key={signal.id}>
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
                {/* Top Section: Sleek header */}
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ color: '#FFFFFF', fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                        {signal.defaultCurrency?.toUpperCase()}/{signal.currency?.toUpperCase() || signal.defaultCurrency}
                      </Typography>
                      <Typography sx={{ color: '#9CA3AF', fontSize: 13, fontWeight: 500, mt: 0.5 }}>
                        {signal.action?.toUpperCase()} <span style={{ opacity: 0.5, margin: '0 4px' }}>•</span> {signal.stopLossPips || '--'} Pip SL
                      </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', px: 1.5, py: 0.5, borderRadius: 1.5 }}>
                      <Typography sx={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600 }}>
                        {formatDate(signal.date || signal.createTime || new Date())}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Middle Section: Image */}
                <Box sx={{ width: '100%', height: 160, backgroundColor: '#1F2937', position: 'relative' }}>
                  {signal.graphImage || signal.image ? (
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={signal.graphImage || signal.image}
                        alt="Analysis Graph"
                        sx={{ objectFit: 'cover' }}
                      />
                      {/* Subtle inner shadow overlay */}
                      <Box sx={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)' }} />
                    </Box>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <ShowChartIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.05)' }} />
                    </Box>
                  )}

                  {/* Superimposed Actions (Glassmorphism) */}
                  <Box position="absolute" top={10} right={10} display="flex" gap={1}>
                    <Tooltip title="Editar Señal">
                      <IconButton
                        size="small"
                        onClick={() => setEditSignalData(signal)}
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFF',
                          border: '1px solid rgba(255,255,255,0.1)',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Señal">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteId(signal.id)}
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          backdropFilter: 'blur(8px)',
                          color: '#FCA5A5',
                          border: '1px solid rgba(255,255,255,0.1)',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' }
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Stats Block: Premium dark styling */}
                <Box sx={{ py: 2, px: 2.5, borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ color: '#6B7280', fontSize: 11, fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entrada</Typography>
                      <Typography sx={{ color: '#F3F4F6', fontSize: 15, fontWeight: 700 }}>{signal.entryPrice || '--'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#6B7280', fontSize: 11, fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stop Loss</Typography>
                      <Typography sx={{ color: '#F3F4F6', fontSize: 15, fontWeight: 700 }}>{signal.stopLoss || '--'}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ color: '#6B7280', fontSize: 11, fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Take Profit</Typography>
                      <Typography sx={{ color: '#F3F4F6', fontSize: 15, fontWeight: 700 }}>{signal.takeProfit || '--'}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Bottom Section: Commentary and State Management */}
                <Box sx={{ p: 2.5, pt: 2, flexGrow: 1, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.6, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {signal.comment || "Sin comentarios adicionales."}
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
        <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>¿Eliminar Señal?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Esta acción no se puede deshacer. La alerta será eliminada para siempre de la base de datos de los usuarios.
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
      {editSignalData && (
        <FormSignal
          open={Boolean(editSignalData)}
          onClose={() => setEditSignalData(null)}
          initialData={editSignalData}
        />
      )}
    </Box>
  );
}
