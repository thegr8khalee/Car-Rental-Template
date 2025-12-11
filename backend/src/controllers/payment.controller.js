import { PaymentService } from '../services/payment.service.js';
import { Rental, User } from '../models/index.js';

export const initiatePayment = async (req, res) => {
  try {
    const { rentalId, provider } = req.body;
    const rental = await Rental.findByPk(rentalId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Rental is already paid' });
    }

    let paymentResponse;

    switch (provider) {
      case 'stripe':
        paymentResponse = await PaymentService.createStripePaymentIntent(
          rental.totalCost,
          'usd',
          { rentalId: rental.id }
        );
        break;

      case 'flutterwave':
        paymentResponse = await PaymentService.initiateFlutterwavePayment({
          tx_ref: `rent_${rental.id}_${Date.now()}`,
          amount: rental.totalCost,
          currency: 'USD',
          redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
          customer: {
            email: rental.user.email,
            phonenumber: rental.user.phoneNumber || '0000000000',
            name: rental.user.username,
          },
          customizations: {
            title: 'Car Rental Payment',
            logo: 'https://your-logo-url.com/logo.png',
          },
        });
        break;

      case 'paystack':
        paymentResponse = await PaymentService.initiatePaystackPayment({
          email: rental.user.email,
          amount: rental.totalCost,
          currency: 'NGN', // Paystack defaults to NGN usually, check account settings
          callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
          metadata: { rentalId: rental.id },
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid payment provider' });
    }

    // Update rental with payment method
    await rental.update({ paymentMethod: provider });

    res.status(200).json({
      message: 'Payment initiated',
      data: paymentResponse,
      provider,
    });

  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ message: 'Error initiating payment', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { provider, reference, rentalId } = req.body;
    let isVerified = false;
    let transactionData;

    switch (provider) {
      case 'stripe':
        // For Stripe, we usually verify via webhook or client-side confirmation, 
        // but we can check intent status here if passed paymentIntentId as reference
        const intent = await PaymentService.verifyStripePayment(reference);
        isVerified = intent.status === 'succeeded';
        transactionData = intent;
        break;
      
      case 'flutterwave':
        const flwTx = await PaymentService.verifyFlutterwaveTransaction(reference);
        isVerified = flwTx.status === 'success';
        transactionData = flwTx;
        break;

      case 'paystack':
        const paystackTx = await PaymentService.verifyPaystackTransaction(reference);
        isVerified = paystackTx.status === true && paystackTx.data.status === 'success';
        transactionData = paystackTx;
        break;
    }

    if (isVerified) {
      const rental = await Rental.findByPk(rentalId);
      if (rental) {
        await rental.update({
          paymentStatus: 'paid',
          status: 'confirmed',
          transactionReference: reference,
        });
        return res.status(200).json({ message: 'Payment verified and rental confirmed', status: 'success' });
      }
    }

    res.status(400).json({ message: 'Payment verification failed', status: 'failed' });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};
