"use client";
import { AuthContextProvider } from "../context/AuthContext";
import Profilepage from "../components/Profilepage";
import Onboarding from "../onboarding/page";
import { useMediaQuery } from "@mui/material";



const Profile = () => {
  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <AuthContextProvider>
      <div style={{ position: 'relative', zIndex: 0 }}> 
        <Profilepage />
        <div style={{paddingTop: isMobile ? '70vh' : '80vh', paddingBottom: '100px' }}> 
          <Onboarding />
        </div>
      </div>
    </AuthContextProvider>
  );
};

export default Profile;
