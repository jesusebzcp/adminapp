import { useAuth } from "@app/application/context/AuthContext";
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

export const MainLayout = ({ children }: any) => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const onChangePage = (page: number) => {
    setValue(page);
    switch (page) {
      case 0:
        router.push("/");
        return;
      case 1:
        router.push("/");
      case 2:
        router.push("/");
        return;

      default:
        router.push("/");
        break;
    }
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
          <BottomNavigationAction label="Videos" icon={<OndemandVideoIcon />} />
          <BottomNavigationAction label="Señales" icon={<CellTowerIcon />} />
          <BottomNavigationAction label="Noticias" icon={<NewspaperIcon />} />
        </BottomNavigation>
      </Paper>
    </div>
  );
};
