"use client";
import AdminHome from "../components/AdminHome";
import React from 'react';
import "../globals.css";
import { AuthContextProvider } from "../context/AuthContext";


const AdminPage = () => {  
  return (
    <AuthContextProvider>
    <div style={{ 
      backgroundImage: 'linear-gradient(135deg, #003087, #ffb914)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Lato, sans-serif',
      color: '#fff'
    }}>
      <div style={{
        maxWidth: '800px',
        padding: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
        textAlign: 'center'
      }}>
        <img src="/augustana-logo.png" alt="Augustana College Logo" style={{
          borderRadius: '50%',
          width: '200px',
          marginBottom: '20px'
        }} />
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '30px'
        }}>Welcome to Augustana Admin Panel</h1>
        <AdminHome />
        <p style={{
          marginTop: '30px',
          fontSize: '1.2rem'
        }}>Rommixer Team &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
    </AuthContextProvider>
  );
};

export default AdminPage;
