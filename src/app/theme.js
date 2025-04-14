'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';
import { Poppins } from 'next/font/google';
import './globals.css';
import { red } from '@mui/material/colors';

const poppins = Poppins({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});
const font =  "'Poppins', sans-serif"
const theme = createTheme({
    typography: {
        fontFamily:
            font,
        h1: { fontWeight: 800 },
        h2: { fontWeight: 800 },
        h3: { fontWeight: 800 },
        h4: {
            fontWeight: 400, 
        },
        h5: {
            fontWeight: 700
        },
        h6: {
            fontWeight: 700
        },
        
    }
});

export default theme;