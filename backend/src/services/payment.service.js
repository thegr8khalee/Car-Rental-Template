import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';
import axios from 'axios'; // Using axios for Paystack for better control or paystack-api if preferred

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

export const PaymentService = {
  // --- Stripe ---
  async createStripePaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      console.error('Stripe Error:', error);
      throw new Error('Stripe payment initialization failed');
    }
  },

  // --- Flutterwave ---
  async initiateFlutterwavePayment(payload) {
    try {
      // payload: { tx_ref, amount, currency, redirect_url, customer: { email, phonenumber, name }, customizations: { title, logo } }
      const response = await flw.Payment.standard(payload);
      return response;
    } catch (error) {
      console.error('Flutterwave Error:', error);
      throw new Error('Flutterwave payment initialization failed');
    }
  },

  // --- Paystack ---
  async initiatePaystackPayment(payload) {
    try {
      // payload: { email, amount, currency, callback_url, metadata }
      // Paystack amount is in kobo (cents)
      const params = {
        ...payload,
        amount: Math.round(payload.amount * 100),
      };
      
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        params,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Paystack Error:', error.response?.data || error.message);
      throw new Error('Paystack payment initialization failed');
    }
  },

  // --- Verification Helpers ---
  async verifyStripePayment(paymentIntentId) {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  },

  async verifyFlutterwaveTransaction(transactionId) {
    return await flw.Transaction.verify({ id: transactionId });
  },

  async verifyPaystackTransaction(reference) {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    return response.data;
  }
};
