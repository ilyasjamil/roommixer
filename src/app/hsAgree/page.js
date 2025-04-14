"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button, Container, Grid, Paper, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

function hsAgree() {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const onDrop = acceptedFiles => {
        setFiles(acceptedFiles.map(file => ({
            file: file,  
            preview: URL.createObjectURL(file),
            isPdf: file.type === 'application/pdf',
            name: file.name  
        })));
    };

    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const removeFile = file => () => {
        URL.revokeObjectURL(file.preview);
        setFiles(currentFiles => currentFiles.filter(f => f !== file));
    };

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files).map(file => ({
            ...file,
            preview: URL.createObjectURL(file),
            isPdf: file.type === 'application/pdf'
        }));
        setFiles(newFiles);
    };

    const handleUploadClick = () => {
        if (files.length > 0) {
            const file = files[0].file;  // Using the first file from the array
            const storage = getStorage();
            const storageReference = storageRef(storage, `housingAgreements/agreement.pdf`);  // Static name for all uploads

            uploadBytes(storageReference, file).then((snapshot) => {
                console.log('Uploaded a blob or file!');
                alert('Upload successful!');
            }).catch((error) => {
                console.error('Upload failed:', error);
                alert('Error during upload.');
            });
        } else {
            alert('No file selected. Please select a file to upload.');
        }
    };

    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    return (
        <Container component="main" maxWidth="lg">
            <Typography variant="h4" component="h1" style={{ margin: '20px 0', textAlign: 'center', color: 'darkBlue' }}>
                Please upload the housing agreement
            </Typography>
            <Paper {...getRootProps()} style={{
                padding: 20,
                textAlign: 'center',
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                border: isDragActive ? '2px solid blue' : '2px dashed gray',
                marginBottom: 20
            }}>
                <input {...getInputProps()} />
                {isDragActive ?
                    <Typography>Drop the files here ...</Typography> :
                    <Typography>Drag 'n' drop some files here, or click to select files</Typography>
                }
            </Paper>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                {files.map((file, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Paper style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 10,
                            width: '100%', 
                            maxWidth: '500px', 
                            height: 'auto',
                        }}>
                            <Typography>{file.name}</Typography>
                            <IconButton onClick={removeFile(file)} aria-label="Delete file">
                                <DeleteIcon />
                            </IconButton>
                            {file.isPdf ? (
                                <iframe src={file.preview} style={{ width: '100%', height: 'auto', border: '1px solid black' }} frameBorder="0"></iframe>
                            ) : (
                                <img src={file.preview} alt={file.name} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
            />
            <Grid container spacing={2} justifyContent="center">
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleFileSelect}
                        style={{ marginTop: 20 }}
                    >
                        Select File
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleUploadClick}
                        style={{ marginTop: 20 }}
                    >
                        Upload File
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}

export default hsAgree;
