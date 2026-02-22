import { db } from "@app/application/config/firebase";
import { uploadFile } from "@app/application/util/uploadstorage";
import { CloudUpload } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore/lite";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
type FormSignalProps = {
  onClose(): void;
  open: boolean;
  initialData?: typeof initialState & { id?: string; image?: string; graphImage?: string };
};

const typeOrder = ["Sell Stop", "Buy Stop", "Sell Limit", "Buy Limit"];
export const typeStatus = ["Activa", "Pendiente", "Descartada"];

export const initialState = {
  assetInput: "",
  comment: "",
  action: "",
  entryPrice: "",
  orderType: "",
  relativeRisk: "",
  stopLoss: "",
  stopLossPips: "",
  takeProfit: "",
  status: "Activa",
};
export const FormSignal = ({ onClose, open, initialData }: FormSignalProps) => {
  const matches = useMediaQuery("(min-width:600px)");
  const [values, setValues] = useState(initialData || initialState);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<File>();

  // UseEffect to reset or pre-fill form when opened
  useEffect(() => {
    if (open) {
      setValues(initialData || initialState);
      setImageBase64(undefined);
    }
  }, [open, initialData]);

  const onChange = (name: keyof typeof initialState, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const areAllFieldsValid = Object.values(values).every(
      (field) => field.trim() !== ""
    );

    return areAllFieldsValid;
  };
  const handleImagenChange = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      setImageBase64(file);
    }
  };
  const handleFormSubmit = async () => {
    // Validate form data
    const isValidForm = validateForm();

    if (!isValidForm) {
      toast("Por favor, complete todos los campos correctamente.");
      return;
    }
    // Only require image on creation. On edit, if image is omitted, keep the old one.
    if (!imageBase64 && !initialData?.id) {
      return toast("La imagen es obligatoria");
    }
    try {
      setLoading(true);

      const hasSlash = values.assetInput.includes('/');
      const [base, quote] = hasSlash
        ? values.assetInput.split('/')
        : [values.assetInput, ""];

      const docData: any = {
        defaultCurrency: base.trim(),
        currency: quote ? quote.trim() : "",
        comment: values.comment,
        action: values.action,
        entryPrice: values.entryPrice,
        orderType: values.orderType,
        relativeRisk: values.relativeRisk,
        stopLoss: values.stopLoss,
        stopLossPips: values.stopLossPips,
        takeProfit: values.takeProfit,
        status: values.status,
      };

      // Only parse new image if uploaded
      if (imageBase64) {
        docData.graphImage = await uploadFile(imageBase64, "graph");
      }

      const signalRef = collection(db, "Signals");
      const notificationRef = collection(db, "notifications");

      let finalId = "";
      if (initialData?.id) {
        // Edit Mode
        await updateDoc(doc(db, "Signals", initialData.id), docData);
        finalId = initialData.id;
        toast("Señal actualizada correctamente");
      } else {
        // Creation Mode
        docData.date = Timestamp.fromDate(new Date());
        const docCrate = await addDoc(signalRef, docData);
        finalId = docCrate.id;
        toast("Señal creada correctamente");
      }

      // If we are creating, send notification (or if desired on edit)
      if (!initialData?.id) {
        const titleSymbol = docData.currency ? `${docData.defaultCurrency}/${docData.currency}` : docData.defaultCurrency;
        const not = {
          title: `Tenemos un nuevo análisis para ti ${titleSymbol}`,
          body: "🚀",
          topic: "client",
        };
        await axios.post("/api/sendNotification", not);
        await setDoc(doc(notificationRef, finalId), {
          title: not.title,
          body: not.body,
          type: "signal",
          date: new Date(),
          id: finalId,
        });
      }

      onClose();
      setValues(initialState);
      setImageBase64(undefined);
    } catch (error) {
      console.log("error", error);
      toast("Ocurrió un error al crear la señal");
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <Dialog open>
        <Typography>{"Cargando...."}</Typography>
      </Dialog>
    );
  }
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{initialData?.id ? 'Editar Señal' : 'Creador de señales'}</DialogTitle>
      <DialogContent>
        {imageBase64 ? (
          <Image
            width={200}
            height={200}
            src={URL.createObjectURL(imageBase64)}
            alt={""}
          />
        ) : initialData?.graphImage || initialData?.image ? (
          <Image
            width={200}
            height={200}
            src={initialData.graphImage || initialData.image || ""}
            alt={"Previous"}
          />
        ) : null}
        <Box
          {...(matches && {
            width: 500,
          })}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, mb: 2 }}
        >
          <TextField
            fullWidth
            label="Activo (Ej: EUR/USD o Nasdaq)"
            value={values.assetInput}
            onChange={(e) => onChange("assetInput", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Tipo de orden</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={values.orderType}
              label="Tipo de orden"
              onChange={(e: SelectChangeEvent) =>
                onChange("orderType", e.target.value)
              }
            >
              {typeOrder.map((order) => {
                return (
                  <MenuItem key={order} value={order}>
                    {order}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Estado de la señal
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={values.status}
              label="Estado de señal"
              onChange={(e: SelectChangeEvent) =>
                onChange("status", e.target.value)
              }
            >
              {typeStatus.map((stats) => {
                return (
                  <MenuItem key={stats} value={stats}>
                    {stats}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Precio de entrada"
            value={values.entryPrice}
            onChange={(e) => onChange("entryPrice", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            type="number"
            label="Stop loss"
            value={values.stopLoss}
            onChange={(e) => onChange("stopLoss", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            type="number"
            label="Take profit"
            value={values.takeProfit}
            onChange={(e) => onChange("takeProfit", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Riesgo relativo"
            value={values.relativeRisk}
            onChange={(e) => onChange("relativeRisk", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            type="number"
            label="Pips de Stop Loss"
            value={values.stopLossPips}
            onChange={(e) => onChange("stopLossPips", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Acción"
            placeholder="COMPRA / VENTA"
            value={values.action}
            onChange={(e) => onChange("action", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Comentario"
            value={values.comment}
            onChange={(e) => onChange("comment", e.target.value)}
            multiline
            rows={3}
            InputLabelProps={{ shrink: true }}
          />

          {imageBase64 && (
            <Box mb={2} display="flex" justifyContent="center">
              <Image
                width={200}
                height={200}
                src={URL.createObjectURL(imageBase64)}
                alt={"Preview"}
                style={{ borderRadius: 8 }}
              />
            </Box>
          )}
          <Button
            fullWidth
            component="label"
            variant="contained"
            startIcon={<CloudUpload />}
            sx={{ mb: 2 }}
          >
            Subir gráfica
            <VisuallyHiddenInput
              onChange={handleImagenChange}
              accept="image/*"
              type={"file"}
            />
          </Button>

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button autoFocus variant="contained" onClick={handleFormSubmit}>
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
