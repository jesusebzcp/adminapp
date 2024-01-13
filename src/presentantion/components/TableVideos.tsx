import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useVideos } from "@app/application/feature/useVideos";
import Image from "next/image";
import { Button } from "@mui/material";

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

export function TableVideos() {
  const { videos, getVideos } = useVideos();
  return (
    <TableContainer component={Paper}>
      <Button onClick={getVideos}> {"Recargar"}</Button>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Video</TableCell>
            <TableCell align="right">Titulo</TableCell>
            <TableCell align="right">Comentarios</TableCell>
            <TableCell align="right">Descripción</TableCell>
            <TableCell align="right">Archivos</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {videos.map((video) => (
            <TableRow
              key={video.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell width={200}>
                <Image
                  src={video.coverUrl}
                  alt={""}
                  width={100}
                  height={100}
                  style={{
                    borderRadius: 12,
                  }}
                />
              </TableCell>
              <TableCell align="right">{video?.title}</TableCell>
              <TableCell align="right">
                {video?.comments?.length ?? 0}
              </TableCell>
              <TableCell align="right">{video.description}</TableCell>
              <TableCell align="right">
                <Button color="error">{"Eliminar"}</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
