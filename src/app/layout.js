"use client";

import { Inter } from "next/font/google";
import ResponsiveAppBar from "./components/Newnavbar";
import { AuthContextProvider, UserAuth } from "./context/AuthContext";
import { ThemeProvider } from '@mui/material/styles';
import theme from "./theme";
import { useRouter, usePathname } from "next/navigation";
import { Router } from "react-router-dom";
import AuthCheck from "./components/AuthCheck";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {



  const noBar = ['/', '/AdminPage', '/adminProfile', '/userlist', '/hsAgree', '/questionaire', '/matchedUsers', '/viewReports', '/emailPortal'];
  return (

    <html lang="en">
      <body>
        <AuthContextProvider>
          <ThemeProvider theme={theme}>
            <AuthCheck>
              {!noBar.includes(usePathname()) ? <ResponsiveAppBar></ResponsiveAppBar> : false}
              {children}

            </AuthCheck>
          </ThemeProvider>
        </AuthContextProvider>

      </body>
    </html>

  )
}
