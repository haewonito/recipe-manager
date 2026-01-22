import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);

      if (authUser) {
        // Check if user has a profile in Firestore
        const profile = await fetchUserProfile(authUser.uid, authUser.email);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid, email) => {
    try {
      // First try to find by UID (new format)
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }

      // Fallback: find by email (old format)
      if (email) {
        const usersQuery = query(
          collection(db, "users"),
          where("email", "==", email)
        );
        const snapshot = await getDocs(usersQuery);
        if (!snapshot.empty) {
          const userDocSnap = snapshot.docs[0];
          return { id: userDocSnap.id, ...userDocSnap.data() };
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const createUserProfile = async (profileData) => {
    if (!user) throw new Error("No authenticated user");

    const userData = {
      email: user.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      userName: profileData.userName,
      role: "regularUser",
      authProvider: user.providerData[0]?.providerId || "unknown",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", user.uid), userData);
    const newProfile = { id: user.uid, ...userData };
    setUserProfile(newProfile);
    return newProfile;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    userProfile,
    hasCompletedProfile: !!userProfile,
    login,
    signup,
    loginWithGoogle,
    logout,
    createUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
