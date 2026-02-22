import { FormPromotion } from "@app/presentantion/components/FormPromotion";
import { TablePromotions } from "@app/presentantion/components/TablePromotions";
import { Box, Button, Typography } from "@mui/material";
import Head from "next/head";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

export default function Promotions() {
    const [openForm, setOpenForm] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);

    const handleOpenNew = () => {
        setEditingPromo(null);
        setOpenForm(true);
    };

    const handleEdit = (promo: any) => {
        setEditingPromo(promo);
        setOpenForm(true);
    };

    const handleClose = () => {
        setOpenForm(false);
        setEditingPromo(null);
    };

    return (
        <>
            <Head>
                <title>Promociones | CodigoFX</title>
            </Head>
            <Box>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >
                    <Typography variant="h6">Mis promociones</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenNew}
                        sx={{ fontWeight: "bold" }}
                    >
                        Nueva Promoción
                    </Button>
                </Box>
                <TablePromotions onEdit={handleEdit} />
                <FormPromotion
                    open={openForm}
                    onClose={handleClose}
                    editData={editingPromo}
                />
            </Box>
        </>
    );
}
