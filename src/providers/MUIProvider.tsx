"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: '#212153',
    },
    background: {
      default: '#e3e3e3',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#212153',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export function MUIProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
