import * as React from 'react';
import { Grid, AppBar, Box, Toolbar, IconButton, Typography, Menu, Avatar, Button, Tooltip, MenuItem, Snackbar, Alert, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { UserAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import AdminMessages from './adminmessages';
import MailIcon from '@mui/icons-material/Mail';

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [anchorElInbox, setAnchorElInbox] = React.useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleOpenInboxMenu = (event) => {
        setAnchorElInbox(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleCloseInboxMenu = () => {
        setAnchorElInbox(null);
    };

    const { user, logOut } = UserAuth();

    const uid = user?.uid;

    const handleSignOut = () => {
        if (user) {
            logOut();
            router.push('/#');
        } else {
            router.push('/#');
        }
    }
    const router = useRouter();

    const handleAdminSelect = (adminId) => {
        setSelectedUserId(adminId);
        if (user?.uid && adminId) {
            const messagesRef = collection(db, 'adminMessages');
            const q = query(messagesRef, where("userId", "==", user.uid), where("senderId", "==", adminId));
            onSnapshot(q, (snapshot) => {
                const messages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setConversation(messages);
            });
        }
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 50));
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    useEffect(() => {
        if (user?.uid) {
            const fetchMessages = () => {
                const messagesRef = collection(db, 'adminMessages');
                const q = query(messagesRef, where("userId", "==", user.uid), where("isAdmin", "==", true));
                onSnapshot(q, (snapshot) => {
                    const userMessages = {};

                    snapshot.docs.forEach(doc => {
                        const data = doc.data();
                        const pairKey = [data.senderId, data.userId].sort().join('-');

                        if (!userMessages[pairKey]) {
                            userMessages[pairKey] = {
                                messages: [],
                                lastMessage: data.text,
                                lastTimestamp: data.createdAt,
                                senderId: data.senderId,
                                senderName: data.senderName
                            };
                        }
                        userMessages[pairKey].messages.push({ ...data, id: doc.id });

                        if (data.createdAt > userMessages[pairKey].lastTimestamp) {
                            userMessages[pairKey].lastMessage = data.text;
                            userMessages[pairKey].lastTimestamp = data.createdAt;
                            userMessages[pairKey].senderName = data.senderName;
                        }
                    });

                    const messageSummary = Object.values(userMessages).map(conversation => ({
                        senderId: conversation.senderId,
                        senderName: conversation.senderName,
                        lastMessage: conversation.lastMessage,
                        lastTimestamp: conversation.lastTimestamp
                    }));

                    messageSummary.sort((a, b) => b.lastTimestamp - a.lastTimestamp);

                    setMessages(messageSummary);
                });
            };
            fetchMessages();
        }
    }, [user]);

    return (
        <AppBar position="absolute">
            <Grid container spacing={2} sx={{ paddingLeft: 4, paddingRight: 4 }}>
                <Grid item lg={9} xs={9}>
                    <Toolbar disableGutters onClick={() => { router.push('/dashboard') }}>
                        <Typography
                            variant="h6"
                            className="logo"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                textDecoration: 'none',
                            }}
                        >
                            {'ROOMMIXER'}
                        </Typography>
                    </Toolbar>
                </Grid>
                <Grid item lg={3} xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Toolbar disableGutters>
                        <IconButton
                            color="inherit"
                            onClick={handleOpenInboxMenu}
                            sx={{ marginRight: 2 }}
                        >
                            <MailIcon />
                        </IconButton>
                        <Menu
                            id="inbox-menu"
                            anchorEl={anchorElInbox}
                            open={Boolean(anchorElInbox)}
                            onClose={handleCloseInboxMenu}
                            PaperProps={{
                                style: {
                                    maxHeight: '50vh',
                                    width: '30ch',
                                },
                            }}
                        >
                            {messages.length === 0 ? (
                                <MenuItem disabled>No messages</MenuItem>
                            ) : (
                                messages.map((msg) => (
                                    <MenuItem key={msg.senderId} onClick={() => { handleAdminSelect(msg.senderId); handleCloseInboxMenu(); }} sx={{ color: 'black' }}>
                                        <ListItemAvatar>
                                            <Avatar>{msg.senderName.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={msg.senderName} secondary={msg.lastMessage} />
                                    </MenuItem>
                                ))
                            )}
                        </Menu>
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <AccountCircleIcon fontSize="large" sx={{ color: "white" }}></AccountCircleIcon>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem onClick={() => { router.push('/profile') }}>
                                    <Typography textAlign="center">{'Profile'}</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { router.push('/dashboard') }}>
                                    <Typography textAlign="center">{'Dashboard'}</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { router.push('/match') }}>
                                    <Typography textAlign="center">{'Pick a roommate'}</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { router.push('/rentals') }}>
                                    <Typography textAlign="center">{'Rentals'}</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { router.push('/reviews') }}>
                                    <Typography textAlign="center">{'Reviews'}</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { router.push('/report') }}>
                                    <Typography textAlign="center">{'Report User'}</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { router.push('/agreement') }}>
                                    <Typography textAlign="center">{'Policies'}</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { router.push('/about') }}>
                                    <Typography textAlign="center">{'About'}</Typography>
                                </MenuItem>
                                <MenuItem onClick={handleSignOut}>
                                    <Typography textAlign="center" color='red'>{'Log out'}</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Grid>
            </Grid>
            {selectedUserId && (
                <Box sx={{ position: 'fixed', bottom: 20, width: '100%', paddingTop: '20px', zIndex: 1010 }}>
                    <AdminMessages userId={selectedUserId} messages={conversation} onClose={() => setSelectedUserId(null)} />
                </Box>
            )}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>

                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </AppBar>
    );
}

export default ResponsiveAppBar;
