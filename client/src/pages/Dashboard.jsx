/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import generateReceiptPdf from "../utils/generateReceiptPdf";
import { Banknote, Loader2 } from "lucide-react";
import FullPageLoader from "../components/FullPageLoader";

export default function Dashboard() {
  const { token, timeLeft, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [tooltip, setTooltip] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [userRes, canPayRes, historyRes] = await Promise.all([
          axios.get(`${backend_url}/auth/me`, { headers: { token } }),
          axios.post(`${backend_url}/payment/can-pay`, { token }),
          axios.get(`${backend_url}/payment/history`, { headers: { token } }),
        ]);

        setUser(userRes.data);
        setButtonDisabled(!canPayRes.data.canPay);

        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const displayMonth =
          now.getDate() >= 2
            ? nextMonth.toLocaleString("default", { month: "long" })
            : now.toLocaleString("default", { month: "long" });

        setTooltip(
          canPayRes.data.canPay
            ? ""
            : `Payment button will activate after 2nd ${displayMonth}`
        );

        setHistory(historyRes.data.history || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, [token, backend_url]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${backend_url}/payment/create-order`, { token });
      const { orderId, amount, currency } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        order_id: orderId,
        handler: async (response) => {
          const verify = await axios.post(`${backend_url}/payment/verify-payment`, {
            ...response,
            token,
          });
          setReceipt(verify.data.transaction);
          setButtonDisabled(true);
          location.reload(); // reload to reflect changes
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <FullPageLoader message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-700">
          Session Time Left:{" "}
          {timeLeft
            ? `${Math.floor(timeLeft / 60000)}m ${Math.floor((timeLeft % 60000) / 1000)}s`
            : "Expired"}
        </div>
        <button onClick={logout} className="text-red-600 hover:underline text-sm">
          Logout
        </button>
      </div>

      {user && (
        <div className="bg-white p-4 rounded shadow mb-6 text-sm md:text-base">
          <h2 className="text-lg font-semibold mb-2">User Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
            <p><b>Flat No:</b> {user.flatNo}</p>
            <p><b>Consumer ID:</b> {user.consumerId}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Phone:</b> {user.phone}</p>
            <p><b>Monthly Fee:</b> ₹{user.maintenanceAmount}</p>
            <p>
              <b>Last Payment:</b>{" "}
              {user.lastPaidAt
                ? new Date(user.lastPaidAt).toLocaleString("en-IN")
                : "Not yet paid"}
            </p>
          </div>
        </div>
      )}

      {user?.role !== "admin" && (
        <div className="mb-6 flex items-center justify-center">
          <button
            onClick={handlePayment}
            disabled={buttonDisabled || loading}
            title={tooltip}
            className={`w-full sm:w-auto px-4 py-2 rounded text-white transition duration-200 flex items-center justify-center gap-2 ${
              buttonDisabled || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {buttonDisabled ? tooltip : (
                  <>
                    <Banknote className="w-5 h-5" />
                    Pay Maintenance Fees
                  </>
                )}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="bg-white shadow p-4 rounded border overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 italic">No transactions found.</p>
        ) : (
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border px-4 py-2">Transaction ID</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {history.map((txn) => (
                <tr key={txn._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{txn.transactionId}</td>
                  <td className="border px-4 py-2">
                    {new Date(txn.date).toLocaleString("en-IN")}
                  </td>
                  <td className="border px-4 py-2">₹{txn.amount}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => generateReceiptPdf(txn)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Download Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
