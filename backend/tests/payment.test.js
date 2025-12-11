import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.unstable_mockModule('../src/models/index.js', () => ({
  Rental: {
    findByPk: jest.fn(),
  },
  User: {},
}));

jest.unstable_mockModule('../src/services/payment.service.js', () => ({
  PaymentService: {
    createStripePaymentIntent: jest.fn(),
    initiateFlutterwavePayment: jest.fn(),
    initiatePaystackPayment: jest.fn(),
    verifyStripePayment: jest.fn(),
    verifyFlutterwaveTransaction: jest.fn(),
    verifyPaystackTransaction: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/middleware/protectRoute.js', () => ({
  protectRoute: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  },
}));

// Import mocked modules
const { Rental } = await import('../src/models/index.js');
const { PaymentService } = await import('../src/services/payment.service.js');
const { initiatePayment, verifyPayment } = await import('../src/controllers/payment.controller.js');
const { protectRoute } = await import('../src/middleware/protectRoute.js');

const app = express();
app.use(express.json());

// Setup routes
app.post('/initiate', protectRoute, initiatePayment);
app.post('/verify', protectRoute, verifyPayment);

describe('Payment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /initiate', () => {
    it('should initiate stripe payment', async () => {
      const mockRental = {
        id: 'rental-1',
        totalCost: 100,
        paymentStatus: 'pending',
        user: { email: 'test@example.com' },
        update: jest.fn(),
      };
      Rental.findByPk.mockResolvedValue(mockRental);
      PaymentService.createStripePaymentIntent.mockResolvedValue({ client_secret: 'secret' });

      const res = await request(app)
        .post('/initiate')
        .send({ rentalId: 'rental-1', provider: 'stripe' });

      expect(res.status).toBe(200);
      expect(PaymentService.createStripePaymentIntent).toHaveBeenCalled();
      expect(mockRental.update).toHaveBeenCalledWith({ paymentMethod: 'stripe' });
    });

    it('should return 404 if rental not found', async () => {
      Rental.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post('/initiate')
        .send({ rentalId: 'rental-1', provider: 'stripe' });

      expect(res.status).toBe(404);
    });

    it('should return 400 if rental already paid', async () => {
      Rental.findByPk.mockResolvedValue({ paymentStatus: 'paid' });

      const res = await request(app)
        .post('/initiate')
        .send({ rentalId: 'rental-1', provider: 'stripe' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /verify', () => {
    it('should verify stripe payment and update rental', async () => {
      const mockRental = {
        id: 'rental-1',
        update: jest.fn(),
      };
      Rental.findByPk.mockResolvedValue(mockRental);
      PaymentService.verifyStripePayment.mockResolvedValue({ status: 'succeeded' });

      const res = await request(app)
        .post('/verify')
        .send({ rentalId: 'rental-1', provider: 'stripe', reference: 'pi_123' });

      expect(res.status).toBe(200);
      expect(mockRental.update).toHaveBeenCalledWith(expect.objectContaining({
        paymentStatus: 'paid',
        status: 'confirmed',
      }));
    });

    it('should fail if verification fails', async () => {
      PaymentService.verifyStripePayment.mockResolvedValue({ status: 'requires_payment_method' });

      const res = await request(app)
        .post('/verify')
        .send({ rentalId: 'rental-1', provider: 'stripe', reference: 'pi_123' });

      expect(res.status).toBe(400);
    });
  });
});
