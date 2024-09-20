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
};

const typeOrder = ["Sell Stop", "Buy Stop", "Sell Limit", "Buy Limit"];
export const typeStatus = ["Activa", "Pendiente", "Descartada"];

export const initialState = {
  defaultCurrency: "",
  currency: "",
  comment: "",
  action: "",
  entryPrice: "",
  orderType: "",
  relativeRisk: "",
  stopLoss: "",
  takeProfit: "",
  status: "Activa",
  author: "Miguel Gaitan",
};
export const FormSignal = ({ onClose, open }: FormSignalProps) => {
  const matches = useMediaQuery("(min-width:600px)");
  const [values, setValues] = useState(initialState);
  const [inputValue1, setInputValue1] = React.useState("");
  const [inputValue2, setInputValue2] = React.useState("");
  const [loading, setLoading] = useState(false);
  const [optionsPar, setOptionsPar] = useState<string[]>([]);
  const [imageBase64, setImageBase64] = useState<File>();

  const API_KEY = "bd66f040247f44dab9fe1f80a4f00999";

  const onChange = (name: keyof typeof initialState, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };
  const fetchCurrencyPair = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios({
        method: "get",
        url: `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${API_KEY}`,
      });
      const ratesArray = Object.keys(response.data.rates);
      const arrayFormate: string[] = [];

      ratesArray.map((current) => {
        if (current !== values.defaultCurrency) {
          arrayFormate.push(current);
        }
      });
      setOptionsPar(arrayFormate);
    } catch (error) {
      toast("Ocurrió un error al traer la lista de monedas");
    } finally {
      setLoading(false);
    }
  }, [values.defaultCurrency]);

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
      // If the form is not valid, you can display an error message or perform other actions
      toast("Por favor, complete todos los campos correctamente.");
      return;
    }
    if (!imageBase64) {
      return toast("La imagen es obligatoria");
    }
    try {
      setLoading(true);

      const docData = {
        ...values,
        date: Timestamp.fromDate(new Date()),
        graphImage: await uploadFile(imageBase64, "graph"),
      };
      const signalRef = collection(db, "Signals");
      const notificationRef = collection(db, "notifications");

      const docCrate = await addDoc(signalRef, docData);
      const not = {
        title: `Tenemos un nuevo análisis para ti ${values.defaultCurrency}/${values.currency}`,
        body: "🚀",
        topic: "client",
      };

      await axios.post("/api/sendNotification", not);

      await setDoc(doc(notificationRef), {
        title: not.title,
        body: not.body,
        type: "signal",
        date: new Date(),
        id: docCrate.id,
      });

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

  useEffect(() => {
    fetchCurrencyPair();
  }, [fetchCurrencyPair]);

  if (loading) {
    return (
      <Dialog open>
        <Typography>{"Cargando...."}</Typography>
      </Dialog>
    );
  }
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Creador de señales</DialogTitle>
      <DialogContent>
        {imageBase64 && (
          <Image
            width={200}
            height={200}
            src={URL.createObjectURL(imageBase64)}
            alt={""}
          />
        )}
        <Button
          fullWidth
          component="label"
          variant="contained"
          startIcon={<CloudUpload />}
        >
          Subir gráfica
          <VisuallyHiddenInput
            onChange={handleImagenChange}
            accept="image/*"
            type={"file"}
          />
        </Button>

        <Box my={2} />

        <Box
          {...(matches && {
            width: 500,
          })}
        >
          <Box
            sx={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
            }}
            mb={2}
          >
            <Autocomplete
              fullWidth
              value={values.defaultCurrency}
              onChange={(event: any, newValue) => {
                onChange("defaultCurrency", newValue || "");
              }}
              inputValue={inputValue1}
              onInputChange={(event, newInputValue) => {
                setInputValue1(newInputValue);
              }}
              id="controllable-states-demo"
              options={optionsPar}
              renderInput={(params) => (
                <TextField {...params} label="Moneda1" />
              )}
              renderOption={(props, option: string) => {
                return (
                  <li {...props} key={option}>
                    {option}
                  </li>
                );
              }}
            />
            <Typography mx={2}>{"/"}</Typography>
            <Autocomplete
              fullWidth
              value={values.currency}
              onChange={(event: any, newValue) => {
                onChange("currency", newValue || "");
              }}
              inputValue={inputValue2}
              onInputChange={(event, newInputValue) => {
                setInputValue2(newInputValue);
              }}
              id="controllable-states-demo"
              options={optionsPar}
              renderInput={(params) => (
                <TextField {...params} label="Moneda2" />
              )}
              renderOption={(props, option: string) => {
                return (
                  <li {...props} key={option}>
                    {option}
                  </li>
                );
              }}
            />
          </Box>
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
          <Box my={2} />

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
          <Box my={2} />
          <TextField
            fullWidth
            type="number"
            label="Precio de entrada"
            value={values.entryPrice}
            onChange={(e) => onChange("entryPrice", e.target.value)}
          />
          <Box my={2} />
          <TextField
            fullWidth
            type="number"
            label="Stop loss"
            value={values.stopLoss}
            onChange={(e) => onChange("stopLoss", e.target.value)}
          />
          <Box my={2} />
          <TextField
            fullWidth
            type="number"
            label="Take profit"
            value={values.takeProfit}
            onChange={(e) => onChange("takeProfit", e.target.value)}
          />
          <Box my={2} />
          <Box my={2} />
          <TextField
            fullWidth
            label="Riesgo relativo"
            value={values.relativeRisk}
            onChange={(e) => onChange("relativeRisk", e.target.value)}
          />
          <Box my={2} />
          <TextField
            fullWidth
            label="Acción"
            value={values.action}
            onChange={(e) => onChange("action", e.target.value)}
          />
          <Box my={2} />
          <TextField
            fullWidth
            label="Comentario"
            value={values.comment}
            onChange={(e) => onChange("comment", e.target.value)}
          />
          <TextField
            fullWidth
            label="Author"
            value={values.author}
            onChange={(e) => onChange("author", e.target.value)}
          />
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
