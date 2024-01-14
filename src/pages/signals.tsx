import { useSignals } from "@app/application/feature/useSignals";
import { FormSignal } from "@app/presentantion/components/FormSignal";
import { TableSignals } from "@app/presentantion/components/TableSignals";
import { SignalCellular1Bar } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Signals() {
  const [openForm, setOpenForm] = useState(false);

  return (
    <>
      <Head>
        <title>Administrador | Creador de señales</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Box
          my={2}
          style={{
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">{"Creador de señales"}</Typography>

          <Button
            variant="outlined"
            endIcon={<SignalCellular1Bar />}
            onClick={() => setOpenForm(true)}
          >
            Cargar Señal
          </Button>
        </Box>
        <TableSignals />
        <FormSignal
          onClose={function (): void {
            setOpenForm(false);
          }}
          open={openForm}
        />
      </Box>
    </>
  );
}