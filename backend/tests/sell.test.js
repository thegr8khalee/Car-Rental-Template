import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.unstable_mockModule('../src/models/sell.model.js', () => ({
  default: {
    create: jest.fn(),
    count: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));

// Import mocked modules
const SellNow = (await import('../src/models/sell.model.js')).default;
const cloudinary = (await import('../src/lib/cloudinary.js')).default;
const { submitSellForm } = await import('../src/controllers/sell.controller.js');
const { getSellSubmissionsStats, getSellSubmissions, updateSellSubmissionStatus } = await import('../src/controllers/sellSubmissions.controller.js');

const app = express();
app.use(express.json());
app.post('/sell', submitSellForm);
app.get('/sell/stats', getSellSubmissionsStats);
app.get('/sell/submissions', getSellSubmissions);
app.put('/sell/submissions/:id', updateSellSubmissionStatus);

describe('Sell Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /sell', () => {
    it('should submit sell form successfully', async () => {
      cloudinary.uploader.upload.mockResolvedValue({
        secure_url: 'http://image.url',
        public_id: '123',
      });
      SellNow.create.mockResolvedValue({
        id: 1,
        emailAddress: 'test@example.com',
        carMake: 'Toyota',
        carModel: 'Camry',
        condition: 'Good',
      });

      const res = await request(app)
        .post('/sell')
        .send({
          fullName: 'John Doe',
          phoneNumber: '1234567890',
          emailAddress: 'test@example.com',
          carMake: 'Toyota',
          carModel: 'Camry',
          yearOfManufacture: 2020,
          mileageKm: 50000,
          condition: 'Good',
          uploadPhotos: ['base64image'],
        });

      expect(res.status).toBe(201);
      expect(cloudinary.uploader.upload).toHaveBeenCalled();
      expect(SellNow.create).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/sell')
        .send({
          fullName: 'John Doe',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /sell/stats', () => {
    it('should return submission stats', async () => {
      SellNow.count.mockResolvedValue(5);

      const res = await request(app).get('/sell/stats');

      expect(res.status).toBe(200);
      expect(res.body.data.totalSubmissions).toBe(5);
    });
  });

  describe('GET /sell/submissions', () => {
    it('should return paginated submissions', async () => {
      SellNow.findAndCountAll.mockResolvedValue({
        count: 10,
        rows: [{ id: 1, carMake: 'Toyota' }],
      });

      const res = await request(app).get('/sell/submissions?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data.submissions).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(10);
    });
  });

  describe('PUT /sell/submissions/:id', () => {
    it('should update submission status', async () => {
      const mockSubmission = {
        id: 1,
        offerStatus: 'Pending',
        save: jest.fn(),
      };
      SellNow.findByPk.mockResolvedValue(mockSubmission);

      const res = await request(app)
        .put('/sell/submissions/1')
        .send({ status: 'Accepted' });

      expect(res.status).toBe(200);
      expect(mockSubmission.offerStatus).toBe('Accepted');
      expect(mockSubmission.save).toHaveBeenCalled();
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .put('/sell/submissions/1')
        .send({ status: 'InvalidStatus' });

      expect(res.status).toBe(400);
    });

    it('should return 404 if submission not found', async () => {
      SellNow.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .put('/sell/submissions/999')
        .send({ status: 'Accepted' });

      expect(res.status).toBe(404);
    });
  });
});
