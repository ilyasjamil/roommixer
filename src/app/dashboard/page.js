"use client";
import React from 'react';
import { AuthContextProvider } from "../context/AuthContext";
import Dashboardpage from "../components/Dashboardpage";

const Dashboard = () => {

    return (
        <AuthContextProvider>
            <Dashboardpage>
            </Dashboardpage>
        </AuthContextProvider>
    );
}

export default Dashboard;
