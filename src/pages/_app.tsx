import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { AppCacheProvider } from "@mui/material-nextjs/v14-pagesRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@app/application/config/theme";
import { AuthProvider } from "@app/application/context/AuthContext";
import { AuthLayout } from "@app/presentantion/layout/AuthLayout";
import { MainLayout } from "@app/presentantion/layout/MainLayout";

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  return (
    <AppCacheProvider {...props}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <AuthProvider>
          <AuthLayout>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </AuthLayout>
        </AuthProvider>
      </ThemeProvider>
    </AppCacheProvider>
  );
}
