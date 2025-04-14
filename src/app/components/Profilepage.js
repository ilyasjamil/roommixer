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


const ProfilePage = () => {
  const { user } = UserAuth();
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150.png?text=Profile');
  const [bio, setBio] = useState('');
  const router = useRouter();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


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

  const saveProfile = async () => {
    if (user?.uid) {
      const userProfile = {
        name: user.displayName,
        email: user.email,
        imageUrl: profileImage,
        bio : bio
      };
      await setDoc(doc(db, 'userProfiles', user.uid), userProfile, { merge: true });
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


return (
  <>
    <InteractiveBackground />
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      position: 'absolute',
      top: '32%',
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
        <Button variant="contained" color="primary" onClick={saveProfile} sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}>
          Save Bio
        </Button>
      </Box>
    </Box>
    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
      <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </>
);
};

export default ProfilePage;