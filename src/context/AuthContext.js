// src/context/AuthContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, getGoogleProvider } from "../lib/firebaseClient";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, getGoogleProvider());
      // Auth state listener will handle user and redirect
      router.push("/");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
      alert(error.message); // Show error to user
    }
  };

  // NEW: Sign up with email
  const signUpWithEmail = async (email, password) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle user and redirect
      router.push("/");
    } catch (error) {
      console.error("Error signing up:", error);
      setLoading(false);
      alert(error.message); // Show error to user
    }
  };

  // NEW: Sign in with email
  const signInWithEmail = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle user and redirect
      router.push("/");
    } catch (error) {
      console.error("Error signing in:", error);
      setLoading(false);
      alert(error.message); // Show error to user
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // Auth state listener will set user to null
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
      alert(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signUpWithEmail, // Expose new function
        signInWithEmail, // Expose new function
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
