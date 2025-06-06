import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode"; // ✅ Correct
import { Loader2 } from "lucide-react";

export default function Login() {
    const [consumerId, setConsumerId] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const backend_url = import.meta.env.VITE_BACKEND_URL;

    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decoded = jwtDecode(token);
            if (decoded?.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            console.log(err)
            localStorage.removeItem("token"); // cleanup bad token
        }
    }

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await axios.post(`${backend_url}/auth/login`, { consumerId });
            setOtpSent(true);
            setLoading(false);
        } catch (err) {
            alert(err.response?.data?.message || "Error sending OTP");
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${backend_url}/auth/verify`, {
                consumerId,
                otp,
            });
            login(res.data.token);

            // ✅ Decode token and redirect based on role
            const decoded = jwtDecode(res.data.token);
            if (decoded.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
            setLoading(false);
        } catch (err) {
            alert(err.response?.data?.message || "Error verifying OTP");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    ADYA MANDIR APARTMENT SOCIETY
                </h1>
                <input
                    type="text"
                    placeholder="Consumer ID"
                    className="w-full disabled:cursor-not-allowed border p-2 mb-4"
                    value={consumerId}
                    disabled={otpSent || loading}
                    onChange={(e) => setConsumerId(e.target.value)}
                />
                {otpSent && (
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        className="w-full border p-2 mb-4"
                        value={otp}
                        max={6}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                )}
                <button
                    onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                    disabled={loading}
                    className="w-full bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded hover:bg-blue-700"
                >
                    {otpSent ? (
                        <>
                            <div className="flex items-center justify-center">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-1 animate-spin" />
                                        Verifying OTP...
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-center">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-1 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    "Send OTP"
                                )}
                            </div>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
