import { Box, Typography } from "@mui/material";
import Head from "next/head";
import { TableNews } from "@app/presentantion/components/TableNews";

export default function NewsPage() {
    return (
        <>
            <Head>
                <title>Administrador | Noticias</title>
                <meta name="description" content="Creador de Noticias IA369" />
            </Head>
            <Box>
                <Box
                    my={2}
                    style={{
                        flexDirection: "row",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <Typography variant="h6">{"Creador de Noticias"}</Typography>
                </Box>

                <TableNews />
            </Box>
        </>
    );
}
