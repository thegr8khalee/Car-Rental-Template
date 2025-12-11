import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.unstable_mockModule('../src/models/blog.model.js', () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/comment.model.js', () => ({
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/car.model.js', () => ({
  default: {},
}));

jest.unstable_mockModule('../src/models/review.model.js', () => ({
  default: {},
}));

jest.unstable_mockModule('../src/models/user.model.js', () => ({
  default: {},
}));

jest.unstable_mockModule('../src/middleware/protectRoute.js', () => ({
  protectRoute: (req, res, next) => {
    req.user = { id: 1, username: 'testuser' };
    next();
  },
}));

// Import mocked modules
const Blog = (await import('../src/models/blog.model.js')).default;
const Comment = (await import('../src/models/comment.model.js')).default;
const { viewBlog, commentBlog, updateComment } = await import('../src/controllers/interactions.controller.js');
const { protectRoute } = await import('../src/middleware/protectRoute.js');

const app = express();
app.use(express.json());
app.get('/blogs/:id', viewBlog);
app.post('/blogs/:id/comments', protectRoute, commentBlog);
app.put('/comments/:id', protectRoute, updateComment);

describe('Interactions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /blogs/:id', () => {
    it('should return blog and increment view count', async () => {
      const mockBlog = {
        id: 1,
        title: 'Test Blog',
        viewCount: 0,
        save: jest.fn(),
      };
      Blog.findByPk.mockResolvedValue(mockBlog);

      const res = await request(app).get('/blogs/1');

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test Blog');
      expect(mockBlog.viewCount).toBe(1);
      expect(mockBlog.save).toHaveBeenCalled();
    });

    it('should return 404 if blog not found', async () => {
      Blog.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/blogs/999');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /blogs/:id/comments', () => {
    it('should create a comment', async () => {
      const mockBlog = { id: 1 };
      Blog.findByPk.mockResolvedValue(mockBlog);
      Comment.create.mockResolvedValue({
        id: 1,
        content: 'Nice post',
        blogId: 1,
        userId: 1,
        status: 'approved',
      });

      const res = await request(app)
        .post('/blogs/1/comments')
        .send({ content: 'Nice post' });

      expect(res.status).toBe(201);
      expect(Comment.create).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Nice post',
        blogId: '1',
        userId: 1,
      }));
    });

    it('should return 400 if content is missing', async () => {
      const res = await request(app)
        .post('/blogs/1/comments')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 404 if blog not found', async () => {
      Blog.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .post('/blogs/999/comments')
        .send({ content: 'Nice post' });

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update a comment', async () => {
      const mockComment = {
        id: 1,
        content: 'Old content',
        userId: 1,
        update: jest.fn(),
      };
      Comment.findByPk.mockResolvedValue(mockComment);

      const res = await request(app)
        .put('/comments/1')
        .send({ content: 'New content' });

      expect(res.status).toBe(200);
      expect(mockComment.update).toHaveBeenCalledWith(expect.objectContaining({
        content: 'New content',
        isEdited: true,
      }));
    });

    it('should return 403 if user is not author', async () => {
      const mockComment = {
        id: 1,
        content: 'Old content',
        userId: 2, // Different user
      };
      Comment.findByPk.mockResolvedValue(mockComment);

      const res = await request(app)
        .put('/comments/1')
        .send({ content: 'New content' });

      expect(res.status).toBe(403);
    });

    it('should return 404 if comment not found', async () => {
      Comment.findByPk.mockResolvedValue(null);

      const res = await request(app)
        .put('/comments/999')
        .send({ content: 'New content' });

      expect(res.status).toBe(404);
    });
  });
});
