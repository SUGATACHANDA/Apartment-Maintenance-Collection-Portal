// === File: AdminDashboard.jsx ===
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import FullPageLoader from '../components/FullPageLoader';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const token = localStorage.getItem('token');
    const backend_url = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${backend_url}/admin/all-users`, {
                    headers: { token },
                });
                setUsers(res.data.users);
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [token, backend_url]);

    const fetchUserTransactions = async (consumerId) => {
        try {
            setLoadingTransactions(true);
            const res = await axios.get(`${backend_url}/admin/user-transactions/${consumerId}`, {
                headers: { token },
            });
            setTransactions(res.data.transactions);
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const startEdit = (user) => {
        setEditingUser(user._id);
        setForm({ ...user });
        setSelectedUserId(null);
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setForm({});
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const saveUser = async () => {
        try {
            await axios.put(`${backend_url}/admin/update-user/${editingUser}`, form, {
                headers: { token },
            });
            const updatedUsers = users.map((u) => (u._id === editingUser ? form : u));
            setUsers(updatedUsers);
            cancelEdit();
        } catch (err) {
            console.error('Error updating user:', err);
        }
    };

    if (loading) return <FullPageLoader message="Loading users..." />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
                <button
                    onClick={logout}
                    className="mt-2 sm:mt-0 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto mb-10">
                <table className="min-w-full table-auto text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-4 py-3">Flat No</th>
                            <th className="px-4 py-3">Consumer ID</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Fee</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                {editingUser === user._id ? (
                                    <>
                                        <td className="px-4 py-2">
                                            <input name="flatNo" value={form.flatNo} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input name="consumerId" value={form.consumerId} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input name="email" value={form.email} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input name="phone" value={form.phone} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input name="maintenanceAmount" value={form.maintenanceAmount} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                                        </td>
                                        <td className="px-4 py-2">
                                            <select name="role" value={form.role} onChange={handleChange} className="border rounded px-2 py-1 w-full">
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2 flex flex-wrap gap-2">
                                            <button onClick={saveUser} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Save</button>
                                            <button onClick={cancelEdit} className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition">Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-2">{user.flatNo}</td>
                                        <td className="px-4 py-2">{user.consumerId}</td>
                                        <td className="px-4 py-2">{user.email}</td>
                                        <td className="px-4 py-2">{user.phone}</td>
                                        <td className="px-4 py-2">₹{user.maintenanceAmount}</td>
                                        <td className="px-4 py-2 capitalize">{user.role}</td>
                                        <td className="px-4 py-2 flex flex-wrap gap-2">
                                            <button onClick={() => startEdit(user)} className="text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => { setSelectedUserId(user.consumerId); fetchUserTransactions(user.consumerId); }} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">View Transactions</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUserId && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Transactions for Consumer ID: {selectedUserId}</h2>
                    {loadingTransactions ? (
                        <p className="text-blue-600">Loading transactions...</p>
                    ) : transactions.length === 0 ? (
                        <p className="text-gray-500 italic">No transactions found.</p>
                    ) : (
                        <table className="min-w-full table-auto text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-3">Transaction ID</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn) => (
                                    <tr key={txn._id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">{txn.transactionId}</td>
                                        <td className="px-4 py-2">₹{txn.amount}</td>
                                        <td className="px-4 py-2">{new Date(txn.date).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
