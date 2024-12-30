import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import axiosInstance from "@/utils/axios";
import Cookies from "js-cookie";

const AuthContext = createContext<any>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData, setUserData } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the Credentials cookie if available
  const credentials = Cookies.get();
  console.log("Cookie==>", credentials);

  const fetchUser = async () => {
    try {
      // Retrieve and decode the cookie
      const credentialsCookie = Cookies.get("Credentials");
      /* const decodedCredentials = credentialsCookie
        ? decodeURIComponent(credentialsCookie)
        : "{}"; */
      const credentials = JSON.parse(credentialsCookie); // Parse the JSON string
      console.log("Cookie==>", credentials);

      // Now you can safely access properties like `credentials.name`
      console.log("User name from cookie:", credentials.name);
      console.log("Decoded Credentials:", credentials.name);
    } catch (error) {
      console.log("Error fetching user data", error);
      // Navigate to login page if user is not authenticated
      // navigate("/signin");
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const credentials = Cookies.get();
    console.log("Cookie==>", credentials.name);
  }, [userData.id, location.pathname]);

  return (
    <AuthContext.Provider value={{ userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
