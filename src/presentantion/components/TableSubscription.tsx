import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, Chip, Box, IconButton, Tooltip, Menu, MenuItem, Typography, Avatar, ToggleButton, ToggleButtonGroup } from "@mui/material";
import dayjs from "dayjs";
import { Download } from "@mui/icons-material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import * as XLSX from "xlsx";
import { useUsersDirectory, UserDirectoryData } from "@app/application/feature/useUsersDirectory";
import { FormSubscription } from "./FormSubscription";

export function TableSubscription() {
  const { users, getUsersDirectory, loading, deleteSubscriptionRecord, promoteToAdmin } = useUsersDirectory();
  const [editData, setEditData] = React.useState<UserDirectoryData | null>(null);

  // Menu State
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeUser, setActiveUser] = React.useState<UserDirectoryData | null>(null);
  const openMenu = Boolean(anchorEl);

  // Filter State
  const [filterRole, setFilterRole] = React.useState<string>('todos');

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string | null,
  ) => {
    if (newFilter !== null) {
      setFilterRole(newFilter);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: UserDirectoryData) => {
    setAnchorEl(event.currentTarget);
    setActiveUser(user);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveUser(null);
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const isPremium = user.endDate && dayjs(user.endDate).toDate() > dayjs().toDate();
      const isAdmin = user.rol === 'admin';

      switch (filterRole) {
        case 'admin':
          return isAdmin;
        case 'premium':
          return !isAdmin && isPremium;
        case 'gratis':
          return !isAdmin && !isPremium;
        case 'todos':
        default:
          return true;
      }
    });
  }, [users, filterRole]);

  const downloadPage = () => {
    const dataCopy = filteredUsers.map((u) => {
      return {
        Nombre: u.name,
        Email: u.email,
        Telefono: u.phone,
        Rol: u.rol,
        Vencimiento: u.endDate ? dayjs(u.endDate).format("YYYY-MM-DD") : "N/A",
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataCopy, {
      header: Object.keys(dataCopy[0]),
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Directorio CRM");
    XLSX.writeFile(workbook, `CRM_Clientes_${dayjs().format('YYYYMMDD')}.xlsx`);
  };

  return (
    <Box sx={{ mt: 3, mb: 10 }}>
      <TableContainer component={Paper} sx={{ borderRadius: 4, backgroundColor: '#050B14' }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              right: 0,
              left: 0,
              bottom: 0,
              top: 0,
              background: "rgba(5, 11, 20, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 99,
              borderRadius: 16
            }}
          >
            <h2 style={{ color: '#fff' }}>{"Sincronizando Directorio..."}</h2>
          </div>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: 2 }}>
          <ToggleButtonGroup
            value={filterRole}
            exclusive
            onChange={handleFilterChange}
            aria-label="crm role filter"
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              '& .MuiToggleButton-root': {
                color: 'rgba(255,255,255,0.5)',
                borderColor: 'rgba(255,255,255,0.1)',
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#fff',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)', // Soft Blue Highlighting
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)'
                }
              }
            }}
          >
            <ToggleButton value="todos" aria-label="todos">
              Todos
            </ToggleButton>
            <ToggleButton value="premium" aria-label="premium">
              <WorkspacePremiumIcon sx={{ mr: 1, color: '#10b981', fontSize: 18 }} /> Premium
            </ToggleButton>
            <ToggleButton value="gratis" aria-label="gratis">
              <PersonOutlineIcon sx={{ mr: 1, fontSize: 18 }} /> Gratis
            </ToggleButton>
            <ToggleButton value="admin" aria-label="admin">
              <LocalFireDepartmentIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 18 }} /> Admin
            </ToggleButton>
          </ToggleButtonGroup>

          <Box display="flex" gap={1}>
            <Button variant="contained" color="success" onClick={() => setEditData({} as any)}> + Agregar Cliente </Button>

            <Button variant="outlined" endIcon={<Download />} onClick={downloadPage} sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>
              Descargar Lista (.csv)
            </Button>
          </Box>
        </Box>

        <Table sx={{ minWidth: 650 }} aria-label="crm table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>Contacto</TableCell>
              <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>Suscripción</TableCell>
              <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>Opciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => {
              const isPremium = user.endDate && dayjs(user.endDate).toDate() > dayjs().toDate();

              return (
                <TableRow
                  key={user.id || user.email}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "& td": { borderBottom: '1px solid rgba(255,255,255,0.05)' },
                    transition: 'background-color 0.2s',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' }
                  }}
                >
                  {/* Cliente Info */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: isPremium ? '#00e676' : 'rgba(255,255,255,0.2)', width: 32, height: 32, fontSize: 14 }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{user.name || "Sin Nombre"}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Contacto */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {user.phone || "No Registrado"}
                    </Typography>
                  </TableCell>

                  {/* Rol y Plan */}
                  <TableCell align="center">
                    <Box display="flex" flexDirection="column" gap={0.5} alignItems="center">
                      {user.rol === 'admin' ? (
                        <Typography variant="caption" sx={{ color: '#f5a623', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, backgroundColor: 'rgba(245, 166, 35, 0.1)', px: 1, py: 0.5, borderRadius: 1 }}>
                          <AdminPanelSettingsIcon fontSize="small" /> ADMINISTRADOR
                        </Typography>
                      ) : (isPremium ? (
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WorkspacePremiumIcon fontSize="small" /> PREMIUM
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonOutlineIcon fontSize="small" /> GRATIS
                        </Typography>
                      ))}
                    </Box>
                  </TableCell>

                  {/* Vencimiento & Estado */}
                  <TableCell align="right">
                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                        {user.endDate ? dayjs(user.endDate).format("DD/MM/YYYY") : "—"}
                      </Typography>
                      {user.endDate ? (
                        isPremium ? (
                          <Chip label="Activa" color="success" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                        ) : (
                          <Chip label="Vencida" color="error" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )
                      ) : (
                        <Chip label="Sin Plan" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end">
                      <Tooltip title="Opciones CRM">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, user)}
                          sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredUsers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 5 }}>
                  No hay usuarios que mostrar con el filtro actual
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Action Menu CRM */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              backgroundColor: '#1E293B',
              color: '#fff',
              marginTop: 4,
              minWidth: 200
            },
          }}
        >
          <MenuItem onClick={() => { setEditData(activeUser); handleMenuClose(); }}>
            <EditOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: '#3b82f6' }} /> Ver y Editar Cuenta
          </MenuItem>
          {activeUser?.rol !== 'admin' && (
            <MenuItem onClick={() => { promoteToAdmin(activeUser?.userId || '', activeUser?.id || ''); handleMenuClose(); }}>
              <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1.5, color: '#f59e0b' }} /> Promover a Administrador
            </MenuItem>
          )}
          <MenuItem onClick={() => { activeUser?.subscriptionId && deleteSubscriptionRecord(activeUser.subscriptionId); handleMenuClose(); }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.5, color: '#ef4444' }} /> Eliminar Suscripción
          </MenuItem>
        </Menu>

      </TableContainer>

      {/* Subscription & CRM Editor Modal */}
      {editData && (
        <FormSubscription
          open={Boolean(editData)}
          onClose={() => setEditData(null)}
          initialData={editData}
          onRefresh={getUsersDirectory}
        />
      )}
    </Box>
  );
}
