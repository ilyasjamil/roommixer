"use client";
import React, { useEffect, useState } from 'react';
import { Container, Button, Typography, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, TextField } from '@mui/material';
import Autocomplete from '@mui/lab/Autocomplete';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { UserAuth } from '../context/AuthContext';
import "../globals.css";
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

const Match = () => {
    const { user } = UserAuth();
    const db = getFirestore();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [matchRequests, setMatchRequests] = useState({});
    const [showMatchAnimation, setShowMatchAnimation] = useState(false);
    const [matchedUserNames, setMatchedUserNames] = useState([]);
    const [openMatchesDialog, setOpenMatchesDialog] = useState(false);
    const [openRequestsDialog, setOpenRequestsDialog] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersCollection = collection(db, 'userProfiles');
            const snapshot = await getDocs(usersCollection);
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            setUsers(usersList.filter(u => u.id !== user.uid));
        };

        const fetchMatchRequests = () => {
            const matchRequestsRef = collection(db, 'matchRequests');
            handleMatchAnimation(selectedUser?.id);
            const unsubscribe = onSnapshot(matchRequestsRef, (snapshot) => {
                const requestsData = {};
                const acceptedNames = [];
                snapshot.forEach(doc => {
                    const requestData = doc.data();
                    const key = requestData.from === user.uid ? requestData.to : requestData.from;

                    if (requestData.from === user.uid || requestData.to === user.uid) {
                        requestsData[key] = { ...requestData, id: doc.id };

                        if (requestData.status === 'accepted') {
                            const matchedUser = users.find(u => u.id === key);
                            if (matchedUser) {
                                acceptedNames.push(matchedUser.name);
                            }
                        }
                    }
                });
                setMatchRequests(requestsData);
                setMatchedUserNames(acceptedNames);
            });
            return unsubscribe;
        };

        fetchUsers();
        const unsubscribeMatchRequests = fetchMatchRequests();

        return () => {
            unsubscribeMatchRequests();
        };
    }, [db, user.uid, users]);


    const getRequestDocId = (userId1, userId2) => {
        return [userId1, userId2].sort().join('_');
    };

    const handleRequest = async (otherUserId, action) => {
        const requestId = getRequestDocId(user.uid, otherUserId);
        const requestDocRef = doc(db, 'matchRequests', requestId);

        if (action === 'send') {
            const matchRequest = {
                from: user.uid,
                to: otherUserId,
                status: 'pending'
            };
            await setDoc(requestDocRef, matchRequest);
        } else if (action === 'cancel' || action === 'unmatch' || action === 'decline') {
            await deleteDoc(requestDocRef);
        }
    };

    const handleResponse = async (fromUserId, response) => {
        const requestId = getRequestDocId(user.uid, fromUserId);
        const requestDocRef = doc(db, 'matchRequests', requestId);

        if (response === 'accept') {
            await updateDoc(requestDocRef, { status: 'accepted' });
        } else {
            await deleteDoc(requestDocRef);
        }
    };

    const renderRequestButton = (userId) => {
        const request = matchRequests[userId];
        if (request && request.status === 'accepted') {
            return <Button onClick={() => handleRequest(userId, 'unmatch')} style={{ backgroundColor: 'red', color: 'white', margin: '10px' }}>Unmatch User</Button>;
        } else if (request && request.status === 'pending' && request.from === user.uid) {
            return <Button onClick={() => handleRequest(userId, 'cancel')} style={{ backgroundColor: 'red', color: 'white', margin: '10px' }}>Cancel Request</Button>;
        } else if (request && request.status === 'pending' && request.to === user.uid) {
            return (
                <>
                    <Button onClick={() => handleResponse(userId, 'accept')} style={{ backgroundColor: 'blue', color: 'white', margin: '10px', marginRight: '10px' }} color="primary">Accept Request</Button>
                    <Button onClick={() => handleResponse(userId, 'decline')} style={{ backgroundColor: 'blue', color: 'white', margin: '10px' }} color="secondary">Decline Request</Button>
                </>
            );
        } else if (!request || request.status === 'declined') {
            return (
                <Button onClick={() => handleRequest(userId, 'send')} style={{ backgroundColor: 'blue', color: 'white', margin: '10px', borderRadius: '10px' }}>Send Match Request</Button>
            );
        }
    };

    const dialogStyle = {
        overflowY: 'scroll',
        borderRadius: '10px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
    };

    const handleMatchClick = (userId) => {
        setSelectedUser(users.find(u => u.id === userId));
        handleClose();
    };


    const handleOpenMatches = () => {
        setOpenMatchesDialog(true);
    };


    const handleOpenRequests = () => {
        setOpenRequestsDialog(true);
    };

    const handleMatchAnimation = (userId) => {
        const matchedUser = users.find(u => u.id === userId);
        if (matchedUser && matchedUserNames.includes(matchedUser.name)) {
            setShowMatchAnimation(true);
            setShowConfetti(true);
        } else {
            setShowConfetti(false);
            setShowMatchAnimation(false);
        }
    };

    const handleClose = () => {
        setOpenMatchesDialog(false);
        setOpenRequestsDialog(false);
    };

    return (
        <Container style={{
            minHeight: '100vh',
            padding: '20px',
            position: 'relative',
            textAlign: 'center'
        }}>
            <Typography variant="h4" sx={{ marginTop: '60px', fontWeight: 'bold' }} gutterBottom>Become Roommates with a user</Typography>
            <FormControl fullWidth style={{ margin: '20px 0' }}>
                <Autocomplete
                    id="user-select"
                    options={users}
                    getOptionLabel={(option) => option.name}
                    value={selectedUser}
                    onChange={(event, newValue) => {
                        setSelectedUser(newValue);
                        if (newValue) {
                            handleMatchAnimation(newValue.id);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Select a User" variant="outlined" />
                    )}
                />
            </FormControl>
            {selectedUser && renderRequestButton(selectedUser.id)}
            {showMatchAnimation && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 20, duration: 0.5 }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 255, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <Typography variant="h4" style={{ textAlign: 'center' }}>Matched!</Typography>
                </motion.div>
            )}
            {showConfetti && (
                <Confetti
                    width={window.fullWidth}
                    height={window.fullHeight}
                    numberOfPieces={500}
                    recycle={false}
                />
            )}
            <Button onClick={handleOpenMatches} variant="contained" color="primary" style={{ margin: '10px' }}>Matches</Button>
            <Button onClick={handleOpenRequests} variant="contained" color="secondary" style={{ margin: '10px', backgroundColor: 'green'}}>Pending Match Requests</Button>

            <Dialog open={openMatchesDialog} onClose={handleClose} PaperProps={{ style: dialogStyle }}>
                <DialogTitle>Matches</DialogTitle>
                <DialogContent>
                    <List>
                        {Object.entries(matchRequests).filter(([key, value]) => value.status === 'accepted').map(([key, value]) => (
                            <ListItem
                                key={key}
                                button
                                onClick={() => handleMatchClick(key)}>
                                <ListItemText primary={`Matched with ${users.find(u => u.id === key).name}`} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openRequestsDialog} onClose={handleClose} PaperProps={{ style: dialogStyle }}>
                <DialogTitle>Match Requests</DialogTitle>
                <DialogContent>
                    <List>
                        {Object.entries(matchRequests).filter(([key, value]) => value.status === 'pending').map(([key, value]) => (
                            <ListItem
                                key={key}
                                button
                                onClick={() => handleMatchClick(key)}>
                                <ListItemText primary={`Request pending with ${users.find(u => u.id === key).name}`} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Match;
