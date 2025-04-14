import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Box, Button, TextField, Container, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { UserAuth } from '../context/AuthContext';

function AdminMessages({ userId, onClose }) {
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [userName, setUserName] = useState('');
    const { user } = UserAuth();

    useEffect(() => {
        async function fetchData() {
            if (userId && user) {
                const userDoc = await getDoc(doc(db, 'userProfiles', userId));
                if (userDoc.exists()) {
                    setUserName(userDoc.data().name);
                } else {
                    console.log("No user profile found");
                    return;
                }

                const messagesRef = collection(db, 'adminMessages');
                const q = query(
                    messagesRef,
                    where("userId", "in", [userId, user.uid]),
                    where("senderId", "in", [userId, user.uid]),
                    orderBy('createdAt')
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const fetchedMessages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setMessages(fetchedMessages.sort((a, b) => a.createdAt - b.createdAt));
                }, error => {
                    console.error("Firestore error:", error);
                });

                return () => unsubscribe();
            } else {
                setMessages([]);
            }
        }

        fetchData();
    }, [userId, user]);

    const sendMessage = async () => {
        if (user && newMessage.trim() !== '') {
            const messageData = {
                text: newMessage,
                createdAt: new Date(),
                senderId: user.uid,
                senderName: user.displayName || user.email.split('@')[0],
                userId: userId,
                isAdmin: true
            };
            await addDoc(collection(db, 'adminMessages'), messageData);
            setMessages([...messages, { ...messageData, id: 'temp-id' }]);
            setNewMessage('');
        }
    };

    return (
        <Container maxWidth="sm" sx={{
            position: 'fixed',
            right: 0,
            top: 0,
            height: '80vh',
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 3,
            bgcolor: 'background.paper',
            borderRadius: 1
        }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 5, top: 38 }}>
                    <CloseIcon />
                </IconButton>
                <Box sx={{
                    mt: 4,
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(135deg, rgba(000,060,250,1) 0%, rgba(120,105,180,1) 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Typography variant="h5" sx={{ fontFamily: "'Roboto', sans-serif", fontWeight: 'bold', fontSize: '20px' }}>
                        Messaging {userName || 'User'}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                my: 2,
                mx: 2,
                p: 2,
                borderRadius: 2
            }}>
                {messages.map((msg) => (
                    <Box key={msg.id} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.senderId === user.uid ? 'flex-end' : 'flex-start',
                        mb: 1,
                        p: 1,
                        bgcolor: msg.senderId === user.uid ? '#D6EAF8' : '#E2EFDA',
                        borderRadius: '20px',
                        maxWidth: '70%',
                        wordWrap: 'break-word'
                    }}>
                        <Typography variant="body2" sx={{ mx: 1, textAlign: 'left', color: "black" }}>
                            {msg.text}
                            <Typography component="span" variant="caption" sx={{ display: 'block', textAlign: 'right', color: 'gray' }}>
                                {msg.createdAt.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString() : msg.createdAt.toLocaleTimeString()}
                            </Typography>
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Box sx={{ p: 2, flexShrink: 0 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} sx={{ mt: 2 }} variant="contained" color="primary">
                    Send
                </Button>
            </Box>
        </Container>
    );
}

export default AdminMessages;
