import { Box, Button, Typography } from "@mui/material";
import Head from "next/head";
import { useState } from "react";
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import { TableNews } from "@app/presentantion/components/TableNews";
import { FormNews } from "@app/presentantion/components/FormNews";

export default function NewsPage() {
    const [openForm, setOpenForm] = useState(false);

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

                    <Button
                        variant="outlined"
                        endIcon={<NewspaperOutlinedIcon />}
                        onClick={() => setOpenForm(true)}
                    >
                        Nueva Noticia
                    </Button>
                </Box>

                <TableNews />
                <FormNews
                    onClose={() => setOpenForm(false)}
                    open={openForm}
                />
            </Box>
        </>
    );
}
