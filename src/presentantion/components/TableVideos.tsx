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

export function TableVideos() {
  const { videos, getVideos, handleDeleteVideo } = useVideos();

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
                <Button
                  color="error"
                  onClick={() => handleDeleteVideo(video.id)}
                >
                  {"Eliminar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
