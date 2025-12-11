import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

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

jest.unstable_mockModule('../src/models/admin.model.js', () => ({
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
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
const Admin = (await import('../src/models/admin.model.js')).default;
const { supabase } = await import('../src/lib/supabase.js');
const { adminSignup, adminLogin, adminLogout } = await import('../src/controllers/admin.controller.js');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/api/admin/signup', adminSignup);
app.post('/api/admin/login', adminLogin);
app.post('/api/admin/logout', adminLogout);

describe('Admin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should create a new admin successfully', async () => {
      const mockAdmin = {
        id: 'admin123',
        username: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'admin123' } },
        error: null,
      });

      Admin.create.mockResolvedValue(mockAdmin);
      Admin.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/admin/signup')
        .send({
          username: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          position: 'Manager',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe('admin@example.com');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/admin/signup')
        .send({
          email: 'admin@example.com',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /login', () => {
    it('should login admin successfully', async () => {
      const mockAdmin = {
        id: 'admin123',
        username: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { id: 'admin123' },
          session: { access_token: 'fake-token' }
        },
        error: null,
      });

      Admin.findByPk.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('admin@example.com');
    });

    it('should return 400 for invalid credentials', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const res = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      const res = await request(app)
        .post('/api/admin/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Admin logged out successfully.');
    });
  });
});
