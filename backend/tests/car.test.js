import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.unstable_mockModule('../src/lib/db.js', () => ({
  default: {
    define: jest.fn(() => ({
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
    })),
    sync: jest.fn(),
    authenticate: jest.fn(),
    fn: jest.fn(),
    col: jest.fn(),
    where: jest.fn(),
    literal: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/car.model.js', () => ({
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/review.model.js', () => ({
  default: {
    findAll: jest.fn(),
  },
}));

const Car = (await import('../src/models/car.model.js')).default;
const Review = (await import('../src/models/review.model.js')).default;
const { getAllCars, getCarById } = await import('../src/controllers/car.controller.js');

const app = express();
app.use(express.json());
app.get('/api/cars', getAllCars);
app.get('/api/cars/:id', getCarById);

describe('Car Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cars', () => {
    it('should return all cars', async () => {
      const mockCars = [{ id: 1, make: 'Toyota', model: 'Camry' }];
      Car.findAndCountAll.mockResolvedValue({ count: 1, rows: mockCars });

      const res = await request(app).get('/api/cars');

      expect(res.statusCode).toBe(200);
      expect(res.body.cars).toEqual(mockCars);
    });
  });

  describe('GET /api/cars/:id', () => {
    it('should return a car by id', async () => {
      const mockCar = { id: 1, make: 'Toyota', model: 'Camry' };
      Car.findByPk.mockResolvedValue(mockCar);
      Car.findAll.mockResolvedValue([]); // For related cars
      Review.findAll.mockResolvedValue([]); // For reviews

      const res = await request(app).get('/api/cars/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.car).toEqual(mockCar);
    });

    it('should return 404 if car not found', async () => {
      Car.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/cars/999');

      expect(res.statusCode).toBe(404);
    });
  });
});
