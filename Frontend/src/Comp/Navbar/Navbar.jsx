import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
const Navbar = () => {
  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    // Send token to backend for verification
    const res = await axios.post(
      "http://localhost:5000/auth/google/token",
      { token },
      {
        withCredentials: true,
      }
    );
    console.log("✅ Login success:", res.data);
  };

  const handleError = () => {
    console.log("❌ Login failed");
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between gap-6 p-4">
      {/* Sign In Button */}
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap />
    </div>
  );
};

export default Navbar;
