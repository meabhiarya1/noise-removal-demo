import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Navbar = () => {
  const [user, setUser] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/google/token",
        { token },
        { withCredentials: true }
      );
      console.log(res.data.user)
      setUser(res.data.user); // Save user info
    } catch (err) {
      console.error("❌ Login failed:", err);
    }
  };

  const handleError = () => {
    console.log("❌ Login failed");
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/user", {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch {
      setUser(null); // Not logged in
    }
  };

  const handleLogout = async () => {
    await axios.get("http://localhost:5000/auth/logout", {
      withCredentials: true,
    });
    setUser(null);
  };

  useEffect(() => {
    fetchUser(); // Check login state on mount
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {!user ? (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      ) : (
        <div className="flex flex-col items-center">
          <img
            src={user.picture}
            alt="Profile"
            className="w-16 h-16 rounded-full"
          />
          <p className="text-lg font-medium">{user.name}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-2 px-4 py-1 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
