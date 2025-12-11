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

jest.unstable_mockModule('../src/models/user.model.js', () => ({
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/admin.model.js', () => ({
  default: {
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
    },
  },
}));

// Import mocked modules
const User = (await import('../src/models/user.model.js')).default;
const { supabase } = await import('../src/lib/supabase.js');
const { signup, login, logout } = await import('../src/controllers/auth.controller.js');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: '123',
        username: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          phoneNumber: '1234567890',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe('test@example.com');
      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('All fields are required');
    });
  });

  describe('POST /login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: '123',
        username: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { id: '123' },
          session: { access_token: 'fake-token' }
        },
        error: null,
      });

      User.findByPk.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.body.email).toBe('test@example.com');
    });

    it('should return 400 for invalid credentials', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Logged Out successfully');
    });
  });
});
