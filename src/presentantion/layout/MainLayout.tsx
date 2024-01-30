import {
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Paper,
} from "@mui/material";
import { useState } from "react";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import CellTowerIcon from "@mui/icons-material/CellTower";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import { useRouter } from "next/router";
import PaidIcon from "@mui/icons-material/Paid";

export const MainLayout = ({ children }: any) => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const onChangePage = (page: number) => {
    setValue(page);
  };
  return (
    <div>
      <Container
        style={{
          paddingTop: 20,
        }}
      >
        {children}
      </Container>
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            onChangePage(newValue);
          }}
        >
          <BottomNavigationAction
            onClick={() => router.push("/")}
            label="Videos"
            icon={<OndemandVideoIcon />}
          />
          <BottomNavigationAction
            onClick={() => router.push("/subscription")}
            label="Señales"
            icon={<CellTowerIcon />}
          />
          <BottomNavigationAction label="Suscripciones" icon={<PaidIcon />} />
        </BottomNavigation>
      </Paper>
    </div>
  );
};
