'use strict'

import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app'
import {  beforeAll, describe, expect, it, test } from 'vitest'

describe('GET /', async () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildApp({
            logger: false
        })
    })

    it('should return 404', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/'
        })
        
        expect(response.statusCode).toBe(404)
    })
});