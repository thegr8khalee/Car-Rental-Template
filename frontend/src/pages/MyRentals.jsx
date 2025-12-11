import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatPrice } from '../lib/utils';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rentals/my-rentals`, {
          withCredentials: true
        });
        setRentals(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  if (loading) return <div className="p-10 text-center pt-20">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 pt-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Rentals</h1>
      {rentals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl">You have no rentals yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-xl">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Car</th>
                <th>Dates</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img src={rental.car?.imageUrls?.[0] || '/placeholder.png'} alt="Car" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{rental.car?.make} {rental.car?.model}</div>
                        <div className="text-sm opacity-50">{rental.car?.year}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div>From: {rental.startDate}</div>
                      <div>To: {rental.endDate}</div>
                    </div>
                  </td>
                  <td className="font-semibold">{formatPrice(rental.totalCost)}</td>
                  <td>
                    <div className={`badge ${rental.status === 'confirmed' ? 'badge-success' : 'badge-warning'} gap-2`}>
                      {rental.status}
                    </div>
                  </td>
                  <td>
                    <div className={`badge ${rental.paymentStatus === 'paid' ? 'badge-success' : 'badge-ghost'} gap-2`}>
                      {rental.paymentStatus}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
