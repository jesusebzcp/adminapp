import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, Chip } from "@mui/material";
import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "@app/application/config/firebase";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Download } from "@mui/icons-material";
import * as XLSX from "xlsx";

export function TableSubscription() {
  const [subscriptions, setSubscriptions] = React.useState([]);

  async function getSubscription() {
    try {
      const videosCol = collection(db, "subscription");
      const subscriptionSnapshot = await getDocs(videosCol);
      const subscriptionList: any = subscriptionSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        endDate: doc.data().endDate.toDate(),
      }));
      setSubscriptions(subscriptionList);
    } catch (error) {
      toast.error("Error en descargar las suscripciones");
    }
  }

  const downloadPage = () => {
    const subscriptionsCopy = subscriptions.map((subscription: any) => {
      return {
        email: subscription.email,
        endDate: subscription.endDate,
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(subscriptionsCopy, {
      header: Object.keys(subscriptionsCopy[0]),
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `page_${Date.now()}.xlsx`);
  };

  const invertDate = (originalDate: Date) => {
    // Suponiendo que originalDate es un string en formato "YYYY-MM-DD"
    const parts = originalDate.toString().split("-");
    const invertedDate = parts.reverse().join("-");
    return invertedDate;
  };

  React.useEffect(() => {
    getSubscription();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Button variant="outlined" endIcon={<Download />} onClick={downloadPage}>
        Descargar suscripciones
      </Button>
      <Button onClick={getSubscription}> {"Recargar"}</Button>

      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Usuario</TableCell>
            <TableCell align="right">Vencimiento</TableCell>
            <TableCell align="right">Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subscriptions.map((subscription: any) => (
            <TableRow
              key={subscription.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>{subscription.email}</TableCell>
              <TableCell align="right">
                {dayjs(subscription?.endDate).format("DD/MM/YYYY")}
              </TableCell>
              <TableCell align="right">
                {dayjs(subscription?.endDate).toDate() < dayjs().toDate() ? (
                  <Chip label="Vencida" color="error" />
                ) : (
                  <Chip label="Activa" color="success" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
