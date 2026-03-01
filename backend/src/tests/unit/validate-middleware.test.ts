import { z } from 'zod';
import type { Request, Response } from 'express';
import type { Boom } from '@hapi/boom';
import { validate } from '../../utils/middleware';

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    ...overrides,
  } as Request;
}

function mockRes(): Response {
  return { locals: {} } as Response;
}

describe('validate middleware', () => {
  describe('body validation', () => {
    const schema = z.object({
      email: z.string(),
      password: z.string(),
    });
    const mw = validate({ body: schema });

    it('passes valid body and replaces req.body with parsed data', () => {
      const req = mockReq({
        body: { email: 'a@b.com', password: 'secret', extra: true },
      });
      const res = mockRes();
      const next = jest.fn();

      mw(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ email: 'a@b.com', password: 'secret' });
      expect(req.body).not.toHaveProperty('extra');
    });

    it('throws boom 400 on missing required field', () => {
      const req = mockReq({ body: { email: 'a@b.com' } });
      const res = mockRes();
      const next = jest.fn();

      try {
        mw(req, res, next);
        fail('Expected mw to throw');
      } catch (err: unknown) {
        const boom = err as Boom;
        expect(boom.isBoom).toBe(true);
        expect(boom.output.statusCode).toBe(400);
        expect(boom.message).toMatch(/required|expected/i);
      }
    });

    it('throws boom 400 on wrong type', () => {
      const req = mockReq({ body: { email: 123, password: 'ok' } });
      const res = mockRes();
      const next = jest.fn();

      expect(() => mw(req, res, next)).toThrow();
      try {
        mw(req, res, next);
      } catch (err: unknown) {
        const boom = err as Boom;
        expect(boom.isBoom).toBe(true);
        expect(boom.output.statusCode).toBe(400);
      }
    });
  });

  describe('params validation', () => {
    const schema = z.object({ id: z.coerce.number().int().positive() });
    const mw = validate({ params: schema });

    it('coerces string param to number and stores on res.locals.params', () => {
      const req = mockReq({ params: { id: '42' } as Record<string, string> });
      const res = mockRes();
      const next = jest.fn();

      mw(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals.params).toEqual({ id: 42 });
    });

    it('throws boom 400 on non-numeric id', () => {
      const req = mockReq({ params: { id: 'abc' } as Record<string, string> });
      const res = mockRes();
      const next = jest.fn();

      expect(() => mw(req, res, next)).toThrow();
      try {
        mw(req, res, next);
      } catch (err: unknown) {
        const boom = err as Boom;
        expect(boom.isBoom).toBe(true);
        expect(boom.output.statusCode).toBe(400);
      }
    });

    it('throws boom 400 on negative id', () => {
      const req = mockReq({ params: { id: '-1' } as Record<string, string> });
      const res = mockRes();
      const next = jest.fn();

      expect(() => mw(req, res, next)).toThrow();
      try {
        mw(req, res, next);
      } catch (err: unknown) {
        const boom = err as Boom;
        expect(boom.isBoom).toBe(true);
        expect(boom.output.statusCode).toBe(400);
      }
    });
  });

  describe('combined body + params', () => {
    const mw = validate({
      params: z.object({ id: z.coerce.number().int().positive() }),
      body: z.object({
        status: z.enum(['learning', 'familiar', 'learned']).optional(),
      }),
    });

    it('validates both params and body together', () => {
      const req = mockReq({
        params: { id: '5' } as Record<string, string>,
        body: { status: 'learning' },
      });
      const res = mockRes();
      const next = jest.fn();

      mw(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals.params).toEqual({ id: 5 });
      expect(req.body).toEqual({ status: 'learning' });
    });

    it('rejects invalid params even when body is valid', () => {
      const req = mockReq({
        params: { id: 'abc' } as Record<string, string>,
        body: { status: 'learning' },
      });
      const res = mockRes();
      const next = jest.fn();

      expect(() => mw(req, res, next)).toThrow();
    });

    it('rejects invalid body even when params are valid', () => {
      const req = mockReq({
        params: { id: '5' } as Record<string, string>,
        body: { status: 'invalid-status' },
      });
      const res = mockRes();
      const next = jest.fn();

      expect(() => mw(req, res, next)).toThrow();
    });
  });
});
