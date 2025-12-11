import { useState, useEffect } from 'react';
import { formatPrice } from '../lib/utils';
import PaymentSelection from './PaymentSelection';
import axios from 'axios';
import toast from 'react-hot-toast';

const BookingWizard = ({ car, user }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [step, setStep] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (days > 0) {
        setTotalCost(days * (car.dailyRate || car.price)); // Fallback to price if dailyRate missing
      } else {
        setTotalCost(0);
      }
    }
  }, [startDate, endDate, car]);

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) return toast.error('Please select dates');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rentals/check-availability`, {
        carId: car.id,
        startDate,
        endDate
      });
      if (res.data.available) {
        setStep(2);
      } else {
        toast.error('Car is not available for these dates');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error checking availability');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSelect = async (provider) => {
    if (!user) return toast.error('Please login to rent a car');
    setLoading(true);
    try {
      // 1. Create Rental Booking (Pending)
      const bookingRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rentals`, {
        carId: car.id,
        startDate,
        endDate,
        paymentMethod: provider
      }, { withCredentials: true });

      const rental = bookingRes.data.rental;

      // 2. Initiate Payment
      const paymentRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/initiate`, {
        rentalId: rental.id,
        provider
      }, { withCredentials: true });

      const { data } = paymentRes.data;

      if (provider === 'flutterwave') {
        // Handle Flutterwave redirect
        if (data.link) window.location.href = data.link;
      } else if (provider === 'paystack') {
        // Handle Paystack redirect
        if (data.authorization_url) window.location.href = data.authorization_url;
      } else if (provider === 'stripe') {
        // Handle Stripe (requires more setup with Elements, for now just log)
        toast.success('Stripe intent created. Redirecting to checkout...');
        // In a real app, you'd redirect to a Stripe Checkout page or show Elements
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Rent this Car</h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">Start Date</label>
              <input 
                type="date" 
                className="input input-bordered" 
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">End Date</label>
              <input 
                type="date" 
                className="input input-bordered" 
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            {totalCost > 0 && (
              <div className="alert alert-info">
                <span>Total Cost: {formatPrice(totalCost)}</span>
              </div>
            )}

            <button 
              className="btn btn-primary w-full" 
              onClick={handleCheckAvailability}
              disabled={loading || totalCost <= 0}
            >
              {loading ? 'Checking...' : 'Check Availability'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-sm">
              <p><strong>Dates:</strong> {startDate} to {endDate}</p>
              <p><strong>Total:</strong> {formatPrice(totalCost)}</p>
            </div>
            <hr/>
            <PaymentSelection onSelect={handlePaymentSelect} />
            <button className="btn btn-ghost btn-sm w-full mt-2" onClick={() => setStep(1)}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
