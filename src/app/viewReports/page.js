"use client"
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';

function ViewReports() {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const userNames = {};
        usersSnapshot.forEach(userDoc => {
            userNames[userDoc.id] = userDoc.data().name; 
        });

        const reportsCollection = collection(db, "userReports");
        const reportsSnapshot = await getDocs(reportsCollection);
        const loadedReports = [];
        reportsSnapshot.forEach(reportDoc => {
            reportDoc.data().reports.forEach(report => {
                loadedReports.push({
                    id: reportDoc.id,
                    reporterName: userNames[reportDoc.id] || 'Unknown',
                    ...report
                });
            });
        });
        setReports(loadedReports);
    };

    const handleRowClick = (report) => {
        setSelectedReport(report);
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleResolveReport = async () => {
        const reportRef = doc(db, "userReports", selectedReport.id);
        await deleteDoc(reportRef);
        setOpenDialog(false);
        fetchReports(); 
    };

    return (
        <div style={{ margin: '20px' }}>
            <h1 style={{color: 'darkBlue', marginBottom: '20px', textAlign: 'center'}}>Reported Issues</h1>
            <TableContainer component={Paper} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Reporter</TableCell>
                            <TableCell>Reported User</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Details</TableCell>
                            <TableCell>Timestamp</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map((report, index) => (
                            <TableRow key={index} hover onClick={() => handleRowClick(report)} style={{ cursor: 'pointer', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.03)' } }}>
                                <TableCell component="th" scope="row">{report.reporterName}</TableCell>
                                <TableCell>{report.username}</TableCell>
                                <TableCell>{report.reason}</TableCell>
                                <TableCell>{report.details}</TableCell>
                                <TableCell>{report.timestamp.toDate().toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {selectedReport && (
                <Dialog open={openDialog} onClose={handleClose} aria-labelledby="report-details-dialog">
                    <DialogTitle id="report-details-dialog">Report Details</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1"><strong>Reporter:</strong> {selectedReport.reporterName}</Typography>
                        <Typography variant="body1"><strong>Reported User:</strong> {selectedReport.username}</Typography>
                        <Typography variant="body1"><strong>Reason:</strong> {selectedReport.reason}</Typography>
                        <Typography variant="body1"><strong>Details:</strong> {selectedReport.details}</Typography>
                        <Typography variant="body1"><strong>Timestamp:</strong> {selectedReport.timestamp.toDate().toLocaleString()}</Typography>
                        <Button onClick={handleResolveReport} color="primary" variant="contained" style={{ marginTop: '20px' }}>Mark as Resolved</Button>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export default ViewReports;
