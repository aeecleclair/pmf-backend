'use strict';

import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { beforeAll, describe, expect, it, test } from 'vitest';

describe('Testing auth', async () => {
  let app: FastifyInstance;
  let randomEmail: string;
  let token: string;

  beforeAll(async () => {
    app = await buildApp({
      logger: false,
    });
    randomEmail = `${Math.random().toString(36).substring(2, 15)}@example.com`;
  });

  it('should not be authorized', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/offers',
    });
    expect(response.statusCode).toBe(401);
  });

  it('should not be able to login with invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: '',
        password: '',
      },
    });
    expect(response.statusCode).toBe(401);
  });

  it('should be able to register a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: randomEmail,
        password: 'strongpassword',
        firstname: 'John',
        lastname: 'Doe',
      },
    });
    expect(response.statusCode).toBe(201);
  });

  it('should be able to login with valid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: randomEmail,
        password: 'strongpassword',
      },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('token');
    token = response.json().token;
  });

  it('should be authorized', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/offers',
      headers: {
        // JWT token in Authorization header
        Authorization: `Bearer ${token}`,
      },
    });
    expect(response.statusCode).toBe(200);
  });

  it('should not be able to register an existing user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: randomEmail,
        password: 'strongpassword',
        firstname: 'John',
        lastname: 'Doe',
      },
    });
    expect(response.statusCode).toBe(400);
  });
});
