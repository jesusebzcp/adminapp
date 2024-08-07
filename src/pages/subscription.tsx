import { db } from "@app/application/config/firebase";
import { FormSignal } from "@app/presentantion/components/FormSignal";
import { TableSubscription } from "@app/presentantion/components/TableSubscription";
import { UploadFile } from "@mui/icons-material";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import {
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  where,
} from "firebase/firestore/lite";
import Head from "next/head";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
const convertExcelDateToJSDate = (excelDate: any) => {
  // La fecha de referencia en Excel es el 30 de diciembre de 1899
  const excelReferenceDate = new Date(1899, 11, 30);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  // Convierte el número de días a milisegundos y suma a la fecha de referencia
  const jsDate = new Date(
    excelReferenceDate.getTime() + excelDate * millisecondsPerDay
  );

  return jsDate;
};

export default function Subscription() {
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const refInput = useRef<any>(null);

  const handleFileUpload = async (e: any) => {
    try {
      setLoading(true);
      const uploadedFile = e.target.files[0];

      if (!uploadedFile) {
        throw new Error("No se seleccionó ningún archivo");
      }

      const response = await validateExcelFile(uploadedFile);

      if (!response || !Array.isArray(response)) {
        throw new Error(
          "El archivo de Excel no es válido o no tiene el formato esperado"
        );
      }

      const formatData = response.map(
        (res: { email: string; endDate: any }) => ({
          email: res.email?.toLowerCase(),
          endDate: convertExcelDateToJSDate(res.endDate),
        })
      );

      const subsRef = collection(db, "subscription");
      const subscriptionExists: any[] = [];
      const newSubscriptions: any[] = [];

      for (const updateSubscription of formatData) {
        if (!updateSubscription.email || !updateSubscription.endDate) {
          console.warn(
            "Datos incompletos en la suscripción:",
            updateSubscription
          );
          continue;
        }

        const q = query(
          subsRef,
          where("email", "==", updateSubscription.email)
        );
        const subscriptionByUser = await getDocs(q);

        if (subscriptionByUser.docs.length > 0) {
          const subscription = subscriptionByUser.docs[0];
          if (
            subscription.data().email === updateSubscription.email &&
            subscription.data().endDate === updateSubscription.endDate
          ) {
            console.log(
              "Suscripción ya existente sin cambios:",
              updateSubscription
            );
            continue;
          }
          console.log("Suscripción actualizada:", updateSubscription);
          subscriptionExists.push({
            id: subscription.id, // Se necesita el ID del documento para actualizarlo
            ...subscription.data(),
            ...updateSubscription,
          });
        } else {
          console.log("Nueva suscripción:", updateSubscription);
          newSubscriptions.push(updateSubscription);
        }
      }

      toast.success("Archivo validado, subiendo.....");

      await Promise.all(
        newSubscriptions.map(async (newSubscription) => {
          console.log("Creando suscripción:", newSubscription);
          await addDoc(subsRef, newSubscription);
        })
      );

      await Promise.all(
        subscriptionExists.map(async (updateSubscription) => {
          console.log("Actualizando suscripción:", updateSubscription);
          await updateDoc(doc(db, "subscription", updateSubscription.id), {
            endDate: updateSubscription.endDate,
          });
        })
      );

      toast.success(
        `Se ha actualizado la base de datos. Suscripciones creadas: ${newSubscriptions.length}, Suscripciones actualizadas: ${subscriptionExists.length}`
      );
    } catch (error) {
      console.log("error", error);
      toast.error("Ocurrió un error al crear la suscripción");
    } finally {
      setLoading(false);
    }
  };

  const validateExcelFile = (file: File): Promise<any[]> => {
    toast.warning("Analizando archivo");

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const data = new Uint8Array(event!.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const records = XLSX.utils.sheet_to_json<any>(worksheet);

          // Validación de correo electrónico en los registros
          const validRecords = records.filter((record) => {
            // Asegurarse de que la propiedad 'email' esté presente y sea un correo electrónico válido
            return record.email && isValidEmail(record.email);
          });

          resolve(validRecords);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  };

  return (
    <>
      {loading && (
        <div
          style={{
            position: "absolute",
            right: 0,
            left: 0,
            bottom: 0,
            top: 0,
            background: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99,
          }}
        >
          <h1>{"Cargando y actualizando las suscripciones"}</h1>
        </div>
      )}
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
          <Typography variant="h6">
            {"Administrador de suscripciones"}
          </Typography>
          <ButtonGroup>
            <Button
              variant="contained"
              endIcon={<UploadFile />}
              onClick={() => refInput?.current?.click()}
            >
              Cargar suscripciones
            </Button>
          </ButtonGroup>
        </Box>
        <TableSubscription />
        <FormSignal
          onClose={function (): void {
            setOpenForm(false);
          }}
          open={openForm}
        />
        <input
          ref={refInput}
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          style={{
            opacity: 0,
          }}
        />
      </Box>
    </>
  );
}
