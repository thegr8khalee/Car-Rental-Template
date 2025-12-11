import React from 'react';

const PaymentSelection = ({ onSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Select Payment Method</h3>
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => onSelect('stripe')} 
          className="btn btn-outline btn-primary w-full justify-start"
        >
          <span className="font-bold">Stripe</span> (Credit/Debit Card)
        </button>
        <button 
          onClick={() => onSelect('flutterwave')} 
          className="btn btn-outline btn-secondary w-full justify-start"
        >
          <span className="font-bold">Flutterwave</span> (Mobile Money, Card)
        </button>
        <button 
          onClick={() => onSelect('paystack')} 
          className="btn btn-outline btn-accent w-full justify-start"
        >
          <span className="font-bold">Paystack</span> (Bank Transfer, Card)
        </button>
      </div>
    </div>
  );
};

export default PaymentSelection;
