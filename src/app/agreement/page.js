"use client";
import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button } from '@mui/material';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

function AgreementPreview() {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        const storage = getStorage();
        const storageReference = storageRef(storage, 'housingAgreements/agreement.pdf');
        
        getDownloadURL(storageReference)
            .then((url) => {
                setPdfUrl(url);
            })
            .catch((error) => {
                console.error('Error fetching the file:', error);
                alert('Error fetching the file.');
            });
    }, []);

    return (
        <Container component="main" maxWidth="lg">
            <Typography variant="h4" component="h1" style={{ marginTop: '20px', paddingTop: '70px', marginBottom: '20px', textAlign: 'center' }}>
                Housing Agreement Policy
            </Typography>
            <Typography variant="h7" component="h10" style={{ marginBottom: '50px', textAlign: 'center' }}>
                Carefully read the housing agreement policies below. If you have any questions at any step, please contact us.
            </Typography>
            {pdfUrl ? (
                <Paper style={{
                    padding: 20,
                    textAlign: 'center',
                    minHeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    border: '2px solid gray',
                    marginBottom: 20
                }}>
                    <iframe 
                        src={pdfUrl} 
                        style={{ width: '100%', height: '1000px', border: 'none' }} 
                        frameBorder="0"
                    ></iframe>
                </Paper>
            ) : (
                <Typography variant="h6" style={{ textAlign: 'center', marginTop: '20px' }}>
                    Loading agreement...
                </Typography>
            )}
        </Container>
    );
}

export default AgreementPreview;
