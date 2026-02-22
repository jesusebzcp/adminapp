import {
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Paper,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import SmartDisplayOutlinedIcon from '@mui/icons-material/SmartDisplayOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined';
import { useRouter } from "next/router";

export const MainLayout = ({ children }: any) => {
  const router = useRouter();
  const [value, setValue] = useState(0);

  // Sync state correctly based on URL safely inside a useEffect
  useEffect(() => {
    if (router.pathname.includes("/signals")) {
      setValue(1);
    } else if (router.pathname.includes("/subscription")) {
      setValue(2);
    } else if (router.pathname.includes("/promotions")) {
      setValue(3);
    } else {
      setValue(0);
    }
  }, [router.pathname]);

  return (
    <Box sx={{ backgroundColor: '#050B14', minHeight: '100vh', pb: 12 }}>
      <Container
        maxWidth="lg"
        sx={{
          pt: 5,
        }}
      >
        {children}
      </Container>

      {/* Premium Floating-style Bottom Navigation */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(13, 17, 23, 0.85)', // Sleek dark gray with transparency
          backdropFilter: 'blur(12px)', // Glassmorphism effect
          borderTop: '1px solid rgba(255,255,255,0.05)',
          zIndex: 1000, // Ensure it's above other elements
          pb: 'env(safe-area-inset-bottom)', // Support for iOS safe area
        }}
        elevation={0}
      >
        <BottomNavigation
          showLabels
          value={value}
          sx={{
            backgroundColor: 'transparent',
            height: 72, // Slightly sleeker height
            '& .MuiBottomNavigationAction-root': {
              color: '#6B7280', // Institutional gray
              transition: 'all 0.2s',
              minWidth: 'auto', // Better distribution on mobile
              padding: '6px 0',
            },
            '& .Mui-selected': {
              color: '#FFFFFF', // Pure white for active state
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 600,
              },
            },
            '& .MuiSvgIcon-root': {
              mb: 0.5,
              fontSize: '1.5rem',
            }
          }}
          onChange={(_, newValue) => {
            setValue(newValue);
            const routes = ["/", "/signals", "/subscription", "/promotions"];
            router.push(routes[newValue]);
          }}
        >
          <BottomNavigationAction
            label="Videos"
            icon={<SmartDisplayOutlinedIcon />}
          />
          <BottomNavigationAction
            label="Señales"
            icon={<ShowChartIcon />}
          />
          <BottomNavigationAction
            label="Suscripción"
            icon={<WorkspacePremiumOutlinedIcon />}
          />
          <BottomNavigationAction
            label="Promociones"
            icon={<DiscountOutlinedIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};
