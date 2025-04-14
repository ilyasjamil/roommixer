"use client";
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth } from '../firebase'; 
import Autocomplete from '@mui/lab/Autocomplete';
import TextField from '@mui/material/TextField';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme, useMediaQuery } from '@mui/material';

function ReportPage() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); 
    const [username, setUsername] = useState(null);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user); 
            } else {
                setCurrentUser(null); 
            }
        });

        return () => unsubscribe(); 
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersCollection = collection(db, "userProfiles");
            const snapshot = await getDocs(usersCollection);
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        };

        fetchUsers();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!currentUser) {
            alert("You must be logged in to submit a report.");
            return;
        }

        const currentUserInfo = users.find(user => user.id === currentUser.uid); 
        const currentUserName = currentUserInfo ? currentUserInfo.name : "Unknown";

        const userReportRef = doc(db, "userReports", username);
        const selectedUserInfo = users.find(user => user.id === username);
        const selectedUserName = selectedUserInfo ? selectedUserInfo.name : "Unknown";

        try {
            const reportEntry = {
                reporterName: currentUserName, 
                username: selectedUserName, 
                reason: reason,
                details: details,
                timestamp: new Date()
            };

            const userReportSnap = await getDoc(userReportRef);
            if (userReportSnap.exists()) {
                await updateDoc(userReportRef, {
                    reports: arrayUnion(reportEntry)
                });
            } else {
                await setDoc(userReportRef, {
                    reports: [reportEntry]
                });
            }
            alert('Report submitted successfully!');
            setUsername('');
            setReason('');
            setDetails('');
        } catch (error) {
            console.error("Error writing document: ", error);
            alert('Error submitting report. Please try again.');
        }
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        padding: isMobile ? '10px' : '20px',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        fontSize: '16px',
        backgroundColor: 'white',
        color: '#000',
        border: 'solid 1px #000',
    };

    const buttonStyle = {
        ...inputStyle,
        backgroundColor: '#F5A623',
        color: 'black',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
    };

    return (
        <div style={formStyle}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Report Inappropriate Behavior</h1>
            <form onSubmit={handleSubmit} style={{ width: isMobile ? '100%' : '400px' }}>
                <label style={{ width: '100%', marginBottom: '10px' }} >
                    Username of User:
                    <Autocomplete
                        id="user-select"
                        options={users}
                        getOptionLabel={(option) => option.name}
                        value={users.find(user => user.id === username)}
                        onChange={(event, newValue) => {
                            setUsername(newValue ? newValue.id : '');
                        }}
                        style={{border: 'solid 1px #000'}}
                        renderInput={(params) => (
                            <TextField {...params} label="Select a User" variant="outlined" fullWidth />
                        )}
                    />
                </label>
                <label style={{ width: '100%', marginBottom: '10px' }}>
                    Reason for Report:
                    <select value={reason} onChange={e => setReason(e.target.value)} style={inputStyle} required>
                        <option value="">Select a reason</option>
                        <option value="inaccurate_profile">Inaccurate Profile Information</option>
                        <option value="unresponsive">Unresponsive or Inactive</option>
                        <option value="inappropriate_communication">Inappropriate Communication</option>
                        <option value="harassment">Harassment or Bullying</option>
                        <option value="illegal_activity">Illegal Activity</option>
                        <option value="other">Other</option>
                    </select>
                </label>
                <label style={{ width: '100%', marginBottom: '10px' }}>
                    Details (please explain the issue):
                    <textarea
                        value={details}
                        onChange={e => setDetails(e.target.value)}
                        style={{ ...inputStyle, height: '100px' }}
                        required
                    />
                </label>
                <button type="submit" style={buttonStyle}>Submit Report</button>
            </form>
        </div>
    );
}

export default ReportPage;
