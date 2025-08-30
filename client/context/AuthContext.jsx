import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import toast  from "react-hot-toast";
import {io} from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider= ({ children })=>{
    
    const [token, setToken]= useState(localStorage.getItem("token"));
    const [authUser, setAuthUser]= useState(null);
    const [onlineUsers, setOnlineUsers]= useState([]);
    const [socket, setSocket]= useState(null);

    // Check if user is authenticated and if so, set the user data and connect the socket

    const checkAuth = async () => {
        try {
            const {data}=await axios.get("/api/auth/check");
            if(data.success){
                setAuthUser(data.userData)
                connectSocket(data.userData)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


//Login function to handle user authentication and socket connection

const login = async (state, credentials) => {
    try {
        const {data}=await axios.post(`/api/auth/${state}`, credentials);
        if(data.success){
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
    }
    else{
                toast.error(data.message)
            }
    } catch (error) {
        toast.error(error.message)
    }
    
}

//Logout function to handle user logout and socket disconnection

const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["Authorization"] = null;
    toast.success("Logged out successfully");
    socket.disconnect();

}

//Update profile function to handle user profile updates

const updateProfile = async (body) => {
  try {
    const token = localStorage.getItem("token"); // ✅ get token
    const { data } = await axios.put("/api/auth/update-profile", body, {
      headers: { Authorization: `Bearer ${token}` }, // ✅ send token
    });

    if (data.success) {
      setAuthUser(data.userData); // ✅ update context
      localStorage.setItem("authUser", JSON.stringify(data.userData)); // ✅ persist update
      toast.success("Profile updated successfully");
    } else {
      toast.error(data.message || "Failed to update profile");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};


    //Connect Socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket= io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);
        
        newSocket.on("getOnlineUsers",(userIds)=>{
                setOnlineUsers(userIds);
        })
    }


    useEffect(() => {
    if(token){
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    checkAuth();
    }, []);


    const value={
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile

    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}