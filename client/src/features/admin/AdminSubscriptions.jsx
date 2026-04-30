import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const AdminSubscriptions = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/admin/payments');
      setPayments(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-[#9A98C3]">Loading subscriptions...</div>;

  return (
    <div className="p-8 text-[#E8E8FF]">
      <h1 className="text-3xl font-bold mb-2">Subscription Analytics</h1>
      <p className="text-[#9A98C3] mb-8">Track platform revenue and active subscriptions.</p>
      
      <div className="bg-[#14122D] border border-[#2C2A4A] rounded-xl overflow-hidden shadow-2xl shadow-black/50 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#1E1C3A] border-b border-[#2C2A4A]">
              <th className="p-4 font-semibold text-[#9A98C3]">ID</th>
              <th className="p-4 font-semibold text-[#9A98C3]">User Email</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Amount</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Status</th>
              <th className="p-4 font-semibold text-[#9A98C3]">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} className="border-b border-[#2C2A4A]/50 hover:bg-[#1E1C3A]/50 transition-colors">
                <td className="p-4 text-[#9A98C3]">#{payment.id}</td>
                <td className="p-4 font-medium">{payment.userEmail || `#${payment.userId}`}</td>
                <td className="p-4 text-green-400 font-bold">₹{payment.amount}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    payment.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="p-4 text-[#9A98C3]">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            
            {payments.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[#9A98C3]">
                  No subscriptions found in the system.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
