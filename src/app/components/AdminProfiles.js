import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, IconButton, Button, styled, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import AdminMessages from '../components/adminmessages'; 
import { Snackbar } from '@mui/material'; 
import Alert from '@mui/material/Alert';
import { useMediaQuery, useTheme } from '@mui/material';



const InteractiveBackground = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'radial-gradient(circle, #112233, #3344ff, #cceeff)',
  clipPath: 'circle(80% at center)',
  transition: 'clip-path 0.2s ease',
  zIndex: -1,
}));

const Overlay = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',  
  zIndex: 1000,  
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));


const AdminProfiles = () => {
  const { user } = UserAuth();
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150.png?text=Profile');
  const [bio, setBio] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const router = useRouter();
  const [conversation, setConversation] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  useEffect(() => {
    if (user?.uid) {
        const fetchMessages = () => {
            const messagesRef = collection(db, 'adminMessages');
            // Query to fetch messages where the current user is involved and isAdmin is true
            const q = query(messagesRef, where("userId", "==", user.uid), where("isAdmin", "==", true));
            onSnapshot(q, (snapshot) => {
              const userMessages = {};
          
              snapshot.docs.forEach(doc => {
                  const data = doc.data();
                  // Create a unique key for each pair of users, ensuring order does not matter
                  const pairKey = [data.senderId, data.userId].sort().join('-');
          
                  // Initialize the message storage for this pair if it doesn't exist
                  if (!userMessages[pairKey]) {
                      userMessages[pairKey] = {
                          messages: [],
                          lastMessage: data.text,
                          lastTimestamp: data.createdAt,
                          senderId: data.senderId,
                          senderName: data.senderName // store sender name
                      };
                  }
                  // Push the message to the messages array
                  userMessages[pairKey].messages.push({ ...data, id: doc.id });
          
                  // Update the lastMessage, lastTimestamp, and senderName if this message is newer
                  if (data.createdAt > userMessages[pairKey].lastTimestamp) {
                      userMessages[pairKey].lastMessage = data.text;
                      userMessages[pairKey].lastTimestamp = data.createdAt;
                      userMessages[pairKey].senderName = data.senderName;
                  }
              });
          
              // Extract minimal data for the list view
              const messageSummary = Object.values(userMessages).map(conversation => ({
                  senderId: conversation.senderId,
                  senderName: conversation.senderName,
                  lastMessage: conversation.lastMessage,
                  lastTimestamp: conversation.lastTimestamp
              }));
          
              // Sort the message summary to show the most recent message first
              messageSummary.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
          
              setMessages(messageSummary);
          });          
          
        };
        fetchMessages();
    }
}, [user]);

  useEffect(() => {
    if (user?.uid) {
      const docRef = doc(db, 'userProfiles', user.uid);
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileImage(data.imageUrl || 'https://via.placeholder.com/150.png?text=Profile');
          setBio(data.bio || '');
        } else {
          setDoc(docRef, {
            name: user.displayName,
            email: user.email,
            imageUrl: profileImage,
            bio: ''
          });
        }
      });
    }
  }, [user]);

  const handleBackToDashboard = () => {
    if (!profileSaved) {
      setOpenSnackbar(true);
      setSnackbarMessage("Please save your profile before accessing the dashboard.");
    } else {
      router.push('/AdminPage');
    }
  };

  const saveProfile = async () => {
    if (user?.uid) {
      const userProfile = {
        name: user.displayName,
        email: user.email,
        imageUrl: profileImage,
        bio: bio
      };
      await setDoc(doc(db, 'userProfiles', user.uid), userProfile, { merge: true });
      setProfileSaved(true);
      setSnackbarMessage('Profile updated successfully!');
      setOpenSnackbar(true);
    }
  };
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && user?.uid) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setProfileImage(imageUrl);
        setDoc(doc(db, 'userProfiles', user.uid), { imageUrl }, { merge: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminSelect = (adminId) => {
    setSelectedUserId(adminId);
    if (user?.uid && adminId) {
        const messagesRef = collection(db, 'adminMessages');
        // This query should fetch all messages where the current user and the admin are involved, either as sender or receiver
        const q = query(messagesRef, where("userId", "==", user.uid), where("senderId", "==", adminId));
        onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConversation(messages); // Set fetched messages into the conversation state
        });
    }
};



return (
  <>
    <InteractiveBackground />
    {selectedUserId && <Overlay />}
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '100%', sm: '90vw' },  
      maxWidth: { xs: '500px', sm: '1000px' }, 
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '15px',
      padding: { xs: '10px', sm: '20px' },
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      zIndex: 1,
    }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: { xs: '10px', sm: '20px' } }}>
        <Typography variant="h4" className="welcome" sx={{ marginBottom: '20px', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Welcome, {user?.displayName || 'Guest'}!
        </Typography>
        <Box sx={{ marginBottom: '20px', borderRadius: '40%', overflow: 'hidden', width: '150px', height: '150px' }}>
          <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%' }} />
        </Box>
        <input type="file" accept="image/*" onChange={handleImageUpload} id="profile-image-upload" style={{ display: 'none' }} />
        <label htmlFor="profile-image-upload">
          <IconButton color="primary" component="span" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', marginBottom: '10px' }}>
            <AddCircleOutlineIcon sx={{ color: '#FFF', fontSize: { xs: '24px', sm: '30px' } }} />
          </IconButton>
        </label>
        <TextField
          label="Add Bio"
          multiline
          rows={4}
          variant="filled"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          fullWidth
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 1,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        />
        <Button variant="contained" color="primary" onClick={saveProfile} sx={{ mt: 2, width: { xs: '100%', sm: 'auto' }, mb: 1.3 }}>
          Save Bio
        </Button>
        <Button variant="outlined" onClick={handleBackToDashboard} sx={{ mt: 1, color: theme.palette.background.default, borderColor: theme.palette.background.default }}>
              Back to Dashboard
            </Button>
      </Box>
      {inboxOpen && (
        <Box flex={1} sx={{ overflowY: 'scroll', maxHeight: '80vh', width: '100%', bgcolor: 'background.paper'}}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {messages.map((msg) => (
              <ListItem key={msg.senderId} button onClick={() => handleAdminSelect(msg.senderId)}>
                <ListItemAvatar>
                  <Avatar>{msg.senderName.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={`${msg.senderName}`} secondary={msg.lastMessage} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>

    {selectedUserId && (
      <Box sx={{ position: 'fixed', bottom: 20, width: '100%', paddingTop: '20px', zIndex: 1010 }}>
        <AdminMessages userId={selectedUserId} messages={conversation} onClose={() => setSelectedUserId(null)} />
      </Box>
    )}
    <Button
      variant="contained"
      color="primary"
      onClick={() => setInboxOpen(!inboxOpen)}
      sx={{ position: 'fixed', bottom: 10, right: 20, width: { xs: '30%', sm: 'auto' }, fontSize: { xs: '0.7rem', sm: '1rem' } }}
    >
      {inboxOpen ? 'Close Inbox' : 'Open Inbox'}
    </Button>

    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
      <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </>
);
};

export default AdminProfiles;