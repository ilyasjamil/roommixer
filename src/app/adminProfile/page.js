"use client";
import { AuthContextProvider } from "../context/AuthContext";
import AdProfile from "../components/AdminProfiles";



const AdminProfile = () => {
  
  return (
    <AuthContextProvider>
        <AdProfile />
    </AuthContextProvider>
  );
};


export default AdminProfile;
