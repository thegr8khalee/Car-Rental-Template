import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.unstable_mockModule('../src/models/index.js', () => ({
  Rental: {
    count: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Car: {
    findByPk: jest.fn(),
  },
  User: {},
  sequelize: {
    transaction: jest.fn((callback) => callback()),
  }
}));

jest.unstable_mockModule('../src/middleware/protectRoute.js', () => ({
  protectRoute: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  },
}));

jest.unstable_mockModule('../src/middleware/protectAdminRoute.js', () => ({
  protectAdminRoute: (req, res, next) => {
    req.user = { id: 'admin-id', role: 'admin' };
    next();
  },
}));

// Import mocked modules
const { Rental, Car } = await import('../src/models/index.js');
const { checkAvailability, createRental, getUserRentals, getAllRentals } = await import('../src/controllers/rental.controller.js');
const { protectRoute } = await import('../src/middleware/protectRoute.js');
const { protectAdminRoute } = await import('../src/middleware/protectAdminRoute.js');

const app = express();
app.use(express.json());

// Setup routes
app.post('/check-availability', checkAvailability);
app.post('/', protectRoute, createRental);
app.get('/my-rentals', protectRoute, getUserRentals);
app.get('/all', protectAdminRoute, getAllRentals);

describe('Rental Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /check-availability', () => {
    it('should return available if no conflicting rentals', async () => {
      Rental.count.mockResolvedValue(0);

      const res = await request(app)
        .post('/check-availability')
        .send({
          carId: 'car-123',
          startDate: '2023-10-01',
          endDate: '2023-10-05',
        });

      expect(res.status).toBe(200);
      expect(res.body.available).toBe(true);
      expect(Rental.count).toHaveBeenCalled();
    });

    it('should return unavailable if conflicting rentals exist', async () => {
      Rental.count.mockResolvedValue(1);

      const res = await request(app)
        .post('/check-availability')
        .send({
          carId: 'car-123',
          startDate: '2023-10-01',
          endDate: '2023-10-05',
        });

      expect(res.status).toBe(200);
      expect(res.body.available).toBe(false);
    });
  });

  describe('POST /', () => {
    it('should create a rental if available', async () => {
      Rental.count.mockResolvedValue(0);
      Car.findByPk.mockResolvedValue({ id: 'car-123', dailyRate: 100 });
      Rental.create.mockResolvedValue({
        id: 'rental-123',
        carId: 'car-123',
        userId: 'test-user-id',
        status: 'pending',
      });

      const res = await request(app)
        .post('/')
        .send({
          carId: 'car-123',
          startDate: '2023-10-01',
          endDate: '2023-10-05', // 5 days
          paymentMethod: 'stripe',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Rental booking created');
      expect(Rental.create).toHaveBeenCalledWith(expect.objectContaining({
        totalCost: 500, // 5 * 100
        userId: 'test-user-id',
      }));
    });

    it('should return 400 if car is not available', async () => {
      Rental.count.mockResolvedValue(1);

      const res = await request(app)
        .post('/')
        .send({
          carId: 'car-123',
          startDate: '2023-10-01',
          endDate: '2023-10-05',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Car is no longer available for these dates.');
    });

    it('should return 404 if car not found', async () => {
      Rental.count.mockResolvedValue(0);
      Car.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post('/')
        .send({
          carId: 'car-123',
          startDate: '2023-10-01',
          endDate: '2023-10-05',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /my-rentals', () => {
    it('should return user rentals', async () => {
      const mockRentals = [{ id: 1, userId: 'test-user-id' }];
      Rental.findAll.mockResolvedValue(mockRentals);

      const res = await request(app).get('/my-rentals');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockRentals);
      expect(Rental.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'test-user-id' },
      }));
    });
  });

  describe('GET /all', () => {
    it('should return all rentals for admin', async () => {
      const mockRentals = [{ id: 1, userId: 'user-1' }, { id: 2, userId: 'user-2' }];
      Rental.findAll.mockResolvedValue(mockRentals);

      const res = await request(app).get('/all');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockRentals);
    });
  });
});
