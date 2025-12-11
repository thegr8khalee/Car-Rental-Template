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
  },
}));

jest.unstable_mockModule('../src/models/car.model.js', () => ({
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/blog.model.js', () => ({
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
    api: {
      delete_resources: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('../src/models/news.model.js', () => ({
  default: {
    findAll: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/broadcast.model.js', () => ({
  default: {
    create: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/services/gmail.service.js', () => ({
  sendEmail: jest.fn(),
}));

const Car = (await import('../src/models/car.model.js')).default;
const Blog = (await import('../src/models/blog.model.js')).default;
const cloudinary = (await import('../src/lib/cloudinary.js')).default;
const { 
  addCar, 
  updateCar, 
  deleteCar, 
  addBlog, 
  updateBlog, 
  deleteBlog 
} = await import('../src/controllers/admin.operations.controller.js');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.post('/api/admin/cars', addCar);
app.put('/api/admin/cars/:id', updateCar);
app.delete('/api/admin/cars/:id', deleteCar);
app.post('/api/admin/blogs', addBlog);
app.put('/api/admin/blogs/:id', updateBlog);
app.delete('/api/admin/blogs/:id', deleteBlog);

describe('Admin Operations Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/cars', () => {
    it('should add a new car', async () => {
      const mockCar = { id: 1, make: 'Toyota', model: 'Camry' };
      Car.create.mockResolvedValue(mockCar);
      cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'http://image.url' });

      const res = await request(app)
        .post('/api/admin/cars')
        .send({ 
          make: 'Toyota', 
          model: 'Camry',
          price: 20000,
          condition: 'New',
          mileage: 0,
          fuelType: 'Petrol',
          transmission: 'Automatic',
          year: 2023,
          bodyType: 'Sedan',
          category: 'Economy',
          engineSize: 2.5,
          horsepower: 200,
          torque: 250,
          drivetrain: 'FWD',
          description: 'Nice car',
          images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='],
          zeroToHundred: 8.5,
          interior: 'Leather',
          exterior: 'Red',
          comfort: 'High',
          safety: '5 Star',
          door: 4,
          color: 'Red',
          cylinder: 4,
          length: 4000,
          width: 1800,
          trunkCapacity: 500,
          tireSize: '18 inch'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(mockCar);
    });
  });

  describe('DELETE /api/admin/cars/:id', () => {
    it('should delete a car', async () => {
      Car.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/api/admin/cars/1');

      expect(res.statusCode).toBe(200);
      expect(Car.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('POST /api/admin/blogs', () => {
    it('should add a new blog', async () => {
      const mockBlog = { id: 1, title: 'Test Blog' };
      Blog.create.mockResolvedValue(mockBlog);
      cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'http://image.url' });

      const res = await request(app)
        .post('/api/admin/blogs')
        .send({ 
          title: 'Test Blog',
          tagline: 'Tagline',
          content: 'Content',
          category: 'News',
          status: 'published',
          author: 'Admin',
          imageUrls: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toEqual(mockBlog);
    });
  });

  describe('DELETE /api/admin/blogs/:id', () => {
    it('should delete a blog', async () => {
      const mockBlog = { 
        id: 1, 
        destroy: jest.fn().mockResolvedValue(true),
        imageUrls: 'http://image.url'
      };
      Blog.findByPk.mockResolvedValue(mockBlog);
      cloudinary.api.delete_resources.mockResolvedValue({});

      const res = await request(app).delete('/api/admin/blogs/1');

      expect(res.statusCode).toBe(200);
      expect(mockBlog.destroy).toHaveBeenCalled();
    });
  });
});
