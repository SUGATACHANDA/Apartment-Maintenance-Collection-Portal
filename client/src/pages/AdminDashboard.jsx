import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from '../components/FullPageLoader';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const backend_url = import.meta.env.VITE_BACKEND_URL

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await axios.get(`${backend_url}/admin/all-transactions`, {
                    headers: { token },
                });
                setTransactions(res.data.transactions);
            } catch (err) {
                console.error('Error fetching transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [token, backend_url]);

    if (loading) {
        return <FullPageLoader message="Fetching transactions..." />;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-center sm:text-left">Admin Dashboard - All Transactions</h1>
                <button onClick={logout} className="text-red-600 hover:underline mt-2 sm:mt-0">
                    Logout
                </button>
            </div>

            {transactions.length > 0 ? (
                <div className="overflow-x-auto bg-white shadow rounded">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="border px-4 py-2">Transaction ID</th>
                                <th className="border px-4 py-2">Consumer ID</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">Amount</th>
                                {/* <th className="border px-4 py-2">Bill Month</th> */}
                                <th className="border px-4 py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn._id} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2">{txn.transactionId}</td>
                                    <td className="border px-4 py-2">{txn.consumerId}</td>
                                    <td className="border px-4 py-2">{txn.email}</td>
                                    <td className="border px-4 py-2">₹ {txn.amount}</td>
                                    {/* <td className="border px-4 py-2">{txn.billMonth || '—'}</td> */}
                                    <td className="border px-4 py-2">{new Date(txn.date).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-600 text-sm mt-12">
                    No transaction records found.
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
