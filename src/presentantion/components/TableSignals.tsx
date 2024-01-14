import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import { useSignals } from "@app/application/feature/useSignals";

export function TableSignals() {
  const { signals, getVideos } = useSignals();

  return (
    <TableContainer component={Paper}>
      <Button onClick={getVideos}> {"Recargar"}</Button>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Monedad</TableCell>
            <TableCell align="right">Riesgo</TableCell>
            <TableCell align="right">Entry point</TableCell>
            <TableCell align="right">Acción</TableCell>
            <TableCell align="right">Comentario</TableCell>
            <TableCell align="right">Tipo de entrada</TableCell>
            <TableCell align="right">Take profit</TableCell>
            <TableCell align="right">Stop loss</TableCell>
            <TableCell align="right">Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {signals.map((signal: any) => (
            <TableRow
              key={signal.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="right">{`${signal.defaultCurrency}/${signal.currency}`}</TableCell>
              <TableCell align="right">{signal.relativeRisk}</TableCell>
              <TableCell align="right">{signal.entryPrice}</TableCell>
              <TableCell align="right">{signal.action}</TableCell>
              <TableCell align="right">{signal.comment}</TableCell>
              <TableCell align="right">{signal.orderType}</TableCell>
              <TableCell align="right">{signal.takeProfit}</TableCell>
              <TableCell align="right">{signal.stopLoss}</TableCell>
              <TableCell align="right">{signal.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
