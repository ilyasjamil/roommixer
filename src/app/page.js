"use client";

import Homepage from "./components/Homepage";
import { AuthContextProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

export default function Home() {
  return (
    <AuthContextProvider>
      <Router>
          <Homepage></Homepage>
      </Router>
    </AuthContextProvider>
  );
}