import { Container, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation'; 
import { UserAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';


function AdminDashboard() {

  const { user, logOut, isAdmin } = UserAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/profile'); 
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [user, isAdmin, router]);

  if (loading) {
    return <CircularProgress />;
  }


  const navigateToHome = () => {
    router.push('/'); 
  };

  const navigateToCustomizeQuestionnaire = () => {
    router.push('/questionaire');
  };

  const navigateToUserList = () => {
    router.push('/userlist');
  };

  const navigateToProfile = () => {
    router.push('/adminProfile'); 
  };
  const navigateToHousingAgreement = () => {
    router.push('/hsAgree'); 
  };
  const navigateToMatches = () => {
    router.push('/matchedUsers'); 
  };
  const navigateToViewReports = () => {
    router.push('/viewReports'); 
  };
  const navigateToEmailPortal = () => {
    router.push('/emailPortal'); 
  };


  const buttonStyle = {
    borderRadius: '30px',
    padding: '12px 24px',
    margin: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    backgroundColor: '#3f51b5',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#ffeb3b',
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box textAlign="center" marginTop={10}>
        <Button variant="contained" color="primary" onClick={navigateToUserList} sx={buttonStyle} style={{ marginRight: '10px' }}>All Users</Button>
        <Button variant="contained" color="primary" onClick={navigateToProfile} sx={buttonStyle}>My Profile</Button>
        <Button variant="contained" color="primary" onClick={navigateToMatches} sx={buttonStyle}>View Matches</Button>
        <Button variant="contained" color="primary" onClick={navigateToViewReports} sx={buttonStyle}>View Reports</Button>
        <Button variant="contained" color="primary" onClick={navigateToEmailPortal} sx={buttonStyle} style={{ marginRight: '10px' }}>Email Portal</Button>
        <Button variant="contained" color="primary" onClick={navigateToCustomizeQuestionnaire} sx={buttonStyle} style={{ marginRight: '10px' }}>Customize Questionnaire</Button>
        <Button variant="contained" color="primary" onClick={navigateToHousingAgreement} sx={buttonStyle}>Housing Agreement</Button>

      <Box display="flex" flexDirection="row" alignItems="center" justifyContent={'center'} marginTop={2} gap={2}>
      <Button variant="contained" color="secondary" onClick={navigateToHome}>Home</Button>
        <Button variant="contained" color="secondary" onClick={() => {logOut(); router.push('/')}}>{'log out'}</Button>
      </Box>
      </Box>
    </Container>
  );
  
}

export default AdminDashboard;
