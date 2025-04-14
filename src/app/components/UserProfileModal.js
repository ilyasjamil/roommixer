"use client";
import { Grid, Button, Box, Card, Typography, Modal, ModalContent, Dialog, Container, useMediaQuery } from "@mui/material";
import { UserAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton } from '@mui/material';
import { db } from '../firebase';
import AdminMessages from '../components/adminmessages';
import { collection, getDocs, query, orderBy, doc, getDoc, onSnapshot, where, getFirestore, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import LockIcon from '@mui/icons-material/Lock';

const UserProfileModal = ({ userProfile, matchingScores }) => {
    const [questions, setQuestions] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [sentRequests, setSentRequests] = useState({});
    const [receivedRequests, setReceivedRequests] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = UserAuth();
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        fetchFriendRequests();
        const fetchQuestionsAndResponses = async () => {
            setIsLoading(true);

            const q = query(collection(db, 'onboardingQuestions'), orderBy('order'));
            const querySnapshot = await getDocs(q);
            const fetchedQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuestions(fetchedQuestions);
            setIsLoading(false);
        };

        if (user) {
            fetchQuestionsAndResponses();
        }

        const unsubscribeSent = onSnapshot(query(collection(db, 'friendRequests'), where('from', '==', user.uid)), (snapshot) => {
            const sentData = {};
            snapshot.forEach(doc => {
                sentData[doc.data().to] = { ...doc.data(), id: doc.id, type: 'sent' };
            });
            setSentRequests(sentData);
        });

        const unsubscribeReceived = onSnapshot(query(collection(db, 'friendRequests'), where('to', '==', user.uid)), (snapshot) => {
            const receivedData = {};
            snapshot.forEach(doc => {
                receivedData[doc.data().from] = { ...doc.data(), id: doc.id, type: 'received' };
            });
            setReceivedRequests(receivedData);
        });

        return () => {
            unsubscribeSent();
            unsubscribeReceived();
        };
    }, [user]);

    const fetchFriendRequests = async () => {
        const db = getFirestore();
        const sentRequestsQuery = query(collection(db, 'friendRequests'), where('from', '==', user.uid));
        const receivedRequestsQuery = query(collection(db, 'friendRequests'), where('to', '==', user.uid));
        const [sentSnapshot, receivedSnapshot] = await Promise.all([
            getDocs(sentRequestsQuery),
            getDocs(receivedRequestsQuery)
        ]);
        const sentData = {}, receivedData = {};
        sentSnapshot.forEach(doc => {
            sentData[doc.data().to] = { ...doc.data(), id: doc.id, type: 'sent' };
        });
        receivedSnapshot.forEach(doc => {
            receivedData[doc.data().from] = { ...doc.data(), id: doc.id, type: 'received' };
        });
        setSentRequests(sentData);
        setReceivedRequests(receivedData);
    };

    const getRequestDocId = (userId1, userId2) => {
        return [userId1, userId2].sort().join('_');
    };

    const handleSendRequest = async (toUserId) => {
        const db = getFirestore();
        const requestId = getRequestDocId(user.uid, toUserId);
        const requestDocRef = doc(db, 'friendRequests', requestId);
        const docSnap = await getDoc(requestDocRef);

        if (docSnap.exists() && docSnap.data().status === 'pending') {
            await deleteDoc(requestDocRef);
        } else if (!docSnap.exists()) {
            await setDoc(requestDocRef, {
                from: user.uid,
                to: toUserId,
                status: 'pending'
            }, { merge: true });
        }
        await fetchFriendRequests();
    };

    const handleRequestResponse = async (fromUserId, response) => {
        const db = getFirestore();
        const requestId = getRequestDocId(user.uid, fromUserId);
        const requestDocRef = doc(db, 'friendRequests', requestId);

        if (response === 'accept') {
            await updateDoc(requestDocRef, { status: 'accepted' });
        } else {
            await updateDoc(requestDocRef, { status: 'declined' });
        }
        await fetchFriendRequests();
    };

    const handleDeleteRequest = async (toUserId) => {
        const db = getFirestore();
        const requestId = getRequestDocId(user.uid, toUserId);
        const requestDocRef = doc(db, 'friendRequests', requestId);
        const docSnap = await getDoc(requestDocRef);

        if (docSnap.exists()) {
            await deleteDoc(requestDocRef);
        }
        await fetchFriendRequests();
    };

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
    }

    const handleClose = () => {
        setSelectedUserId(null);
    };

    const renderRequestButtons = (userId) => {
        const sentRequest = sentRequests[userId];
        const receivedRequest = receivedRequests[userId];

        if ((sentRequest && sentRequest.status === 'accepted') || (receivedRequest && receivedRequest.status === 'accepted')) {
            return (
                <>
                    <Button
                        onClick={() => handleSelectUser(userId)}
                        variant="contained"
                        color="primary"
                    >
                        Message
                    </Button>
                    <Button sx={{color:'red'}} onClick={() => handleDeleteRequest(userId)} color="secondary">Unfriend</Button>
                </>
            );
        }

        if ((sentRequest && sentRequest.status === 'declined') || (receivedRequest && receivedRequest.status === 'declined')) {
            return handleDeleteRequest(userId);
        }

        if (receivedRequest && receivedRequest.type === 'received') {
            return (
                <>
                    <Button sx={{
                        color: 'white',
                        backgroundColor: 'rgba(33, 133, 220, 1)', borderRadius: '10px', '&:hover': {
                            backgroundColor: 'rgba(33, 133, 220, 0.8)', // Slightly lighter blue for hover
                            color: 'white' // Ensure text color stays white on hover
                        }
                    }} onClick={() => handleRequestResponse(userId, 'accept')} color="primary">Accept</Button>
                    <Button sx={{color:'red'}} onClick={() => handleRequestResponse(userId, 'decline')} color="secondary">Decline</Button>
                </>
            );
        } else if (sentRequest && sentRequest.type === 'sent') {
            return <Button sx={{color:'red'}} onClick={() => handleSendRequest(userId)} color="primary">Cancel Pending Request</Button>;
        }

        return <Button variant="primary" sx={{
            color: 'white',
            backgroundColor: 'rgba(33, 133, 220, 1)', borderRadius: '10px', '&:hover': {
                backgroundColor: 'rgba(33, 133, 220, 0.8)', // Slightly lighter blue for hover
                color: 'white' // Ensure text color stays white on hover
            }
        }} onClick={() => handleSendRequest(userId)}>Send Friend Request</Button>;
    };

    const questionsObject = {};
    questions.forEach(el => {
        const { id, ...questionText } = el;
        questionsObject[id] = questionText;
    });

    const [modalOpen, setModalOpen] = useState(false);
    const handleModal = (val) => {
        setModalOpen(val);
    };
    const percentage = 66;
    const responses = userProfile.responses;

    const [index, setIndex] = useState(0);
    const questionsLength = Object.keys(responses).length;

    const nextItem = () => {
        setIndex((index) => {
            let newIndex = index + 1;
            return wrapItems(newIndex);
        });
    };

    const previousItem = () => {
        setIndex((index) => {
            let newIndex = index - 1;
            return wrapItems(newIndex);
        });
    };

    const wrapItems = (itemIndex) => {
        if (itemIndex > questionsLength - 1) {
            return 0;
        } else if (itemIndex < 0) {
            return questionsLength - 1;
        } else {
            return itemIndex;
        }
    };

    const currentItem = Object.values(responses)[index];
    const currentKey = Object.keys(responses)[index];

    return (
        <>
            <Button onClick={() => handleModal(true)} variant="secondary" style={{ background: '#2185dc', color: 'white' }}>
                {'View profile'}
            </Button>
            <Container maxWidth="xl">
                <Dialog
                    id="modal"
                    open={modalOpen}
                    onClose={() => handleModal(false)}
                    aria-describedby="server-modal-description"
                    sx={{
                        "& .MuiDialog-container": {
                            "& .MuiPaper-root": {
                                width: "100%",
                                maxWidth: isMobile ? "100%" : "700px",
                                height: "100%",
                                maxHeight: "90vh",
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden', // Prevent scrollbar in modal
                            },
                        },
                    }}
                >
                    <Grid container spacing={2} sx={{ flex: '1 1 auto', overflowY: 'auto', padding: '2rem' }}>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <img
                                    src={userProfile.imageUrl || `https://via.placeholder.com/150x150.png?text=No+Image`}
                                    alt={`User ${userProfile.name}`}
                                    style={{
                                        width: isMobile ? '100px' : '150px',
                                        height: isMobile ? '100px' : '150px',
                                        borderRadius: '50%',
                                    }}
                                />
                                <Typography variant="h4" sx={{ marginLeft: '1rem', fontFamily: 'Poppins, sans-serif' }}>
                                    {userProfile.name || "Name not available"}
                                </Typography>
                            </Box>
                            <div style={{ width: isMobile ? 75 : 105, height: isMobile ? 75 : 105 }}>
                                <CircularProgressbar
                                    styles={{ path: { stroke: `rgba(33, 133, 220, 1)` }, text: { fill: '#2185dc' } }}
                                    value={matchingScores[userProfile.id] ? matchingScores[userProfile.id].toFixed(1) : 0}
                                    text={`${matchingScores[userProfile.id] ? matchingScores[userProfile.id].toFixed(1) : '0'}%`}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'center', marginTop: '0.5rem' }}>
                            <Typography variant="h5" sx={{ color: 'rgba(33, 133, 220, 1)', fontWeight: 'bold', textAlign: 'center' }}>
                                BIO
                            </Typography>
                            <Typography variant="body1" fontSize={20} sx={{ marginTop: '0.3rem' }}>
                                {userProfile.bio}
                            </Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'center', padding: '0.5rem', marginBottom: '-10px', paddingBottom: '0px' }}>
                            <IconButton aria-label="previous" onClick={previousItem}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={8.2} sx={{ textAlign: 'center', padding: '0.5rem', marginBottom: '-10px' }}>
                            <Typography variant="h5" sx={{ color: 'rgba(33, 133, 220, 1)', fontWeight: 'bold', textAlign: 'center' }}>
                                RESPONSES
                            </Typography>
                        </Grid>
                        <Grid item xs={1.8} sx={{ textAlign: 'center', padding: '0.5rem', marginBottom: '-10px' }}>
                            <IconButton aria-label="next" onClick={nextItem}>
                                <ChevronRightIcon />
                            </IconButton>
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'center', paddingBottom: '0.5rem', marginTop: '0.3rem' }}>
                            <Typography variant="h6" fontSize={25} sx={{ fontWeight: 'bold' }}>
                                {questionsObject[currentKey]?.questionText}
                            </Typography>
                            <Typography variant="body1" fontSize={20} sx={{ marginTop: '2rem' }}>
                                {currentItem?.visibility ? currentItem?.response : <LockIcon />}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container justifyContent="center" sx={{ padding: '1rem' }}>
                        <Grid item>
                            {renderRequestButtons(userProfile.id)}
                            {selectedUserId && <AdminMessages userId={selectedUserId} onClose={handleClose} />}
                        </Grid>
                    </Grid>
                </Dialog>
            </Container>
        </>
    );
};

export default UserProfileModal;

