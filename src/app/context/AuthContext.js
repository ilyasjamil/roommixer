import { useContext, createContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();
export const adminEmails = ["aaronafework20@augustana.edu"];

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: "augustana.edu", 
    });
    signInWithPopup(auth, provider)
      .then((result) => {
        // This will be executed only if the user's email is from augustana.edu
        console.log("Sign in successful!", result);
        const userEmail = result.user.email;
      if (adminEmails.includes(userEmail)) {
        setIsAdmin(true); 
      } // This sets is Admin to true, if user is an admin(There will be 5 admins which are the developers.)
      })
      .catch((error) => {
        if (error.code === 'auth/cancelled-popup-request') {
          console.log("Sign in was cancelled. Please try again.");
        } else if (error.code === 'auth/unauthorized-domain') {
          console.error("The domain of the user's email is not authorized for sign-in.");
        } else {
          console.error("Authentication error:", error);
        }
      });
  };

  
  const logOut = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser ? adminEmails.includes(currentUser.email) : false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, googleSignIn, logOut, isAdmin}}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};