import { Box, Typography, Button } from "@mui/material";
import Head from "next/head";
import { TableBanners } from "@app/presentantion/components/TableBanners";
import { useState } from "react";
import { FormBanner } from "@app/presentantion/components/FormBanner";

export default function BannersPage() {
    const [openForm, setOpenForm] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    }

    return (
        <>
            <Head>
                <title>Administrador | Banners</title>
                <meta name="description" content="Gestor de Banners IA369" />
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
                    <Typography variant="h6">{"Gestor de Banners (Home)"}</Typography>
                    <Button variant="contained" onClick={() => setOpenForm(true)}>
                        Añadir Banner
                    </Button>
                </Box>

                <TableBanners refreshTrigger={refreshTrigger} />

                {openForm && (
                    <FormBanner 
                        open={openForm} 
                        onClose={() => setOpenForm(false)} 
                        onSuccess={handleSuccess} 
                    />
                )}
            </Box>
        </>
    );
}
