import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter'
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptors'
import { CacheService } from '../src/cache/cache.service'
import { getQueueToken } from '@nestjs/bull'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest')

const testEmail = `e2etest_${Date.now()}@gmail.com`

// Mock CacheService — no Redis needed
const mockCacheService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(null),
}

// Mock Bull Queue — no Redis needed
const mockQueue = {
  add: jest.fn().mockResolvedValue(null),
}

describe('Ads Generator App (e2e)', () => {
  let app: INestApplication
  let authToken: string
  let adId: string
  let campaignId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CacheService)
      .useValue(mockCacheService)
      .overrideProvider(getQueueToken('ads'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('ai'))
      .useValue(mockQueue)
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }))
    app.useGlobalFilters(new HttpExceptionFilter())
    app.useGlobalInterceptors(new TransformInterceptor())
    await app.init()
  }, 60000)

  afterAll(async () => {
    await app.close()
  }, 60000)

  // ==================
  // AUTH TESTS
  // ==================
  describe('Auth', () => {
    it('POST /auth/register - should register', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: '123456',
          name: 'E2E Test User',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.access_token).toBeDefined()
      expect(res.body.data.user.email).toBe(testEmail)
      authToken = res.body.data.access_token
    }, 15000)

    it('POST /auth/register - should fail duplicate email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: '123456',
          name: 'E2E Test User',
        })

      expect(res.status).toBe(409)
    }, 15000)

    it('POST /auth/login - should login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: '123456',
        })

      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(300)
      expect(res.body.data.access_token).toBeDefined()
      authToken = res.body.data.access_token
    }, 15000)

    it('POST /auth/login - should fail wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })

      expect(res.status).toBe(401)
    }, 15000)
  })

  // ==================
  // USERS TESTS
  // ==================
  describe('Users', () => {
    it('GET /users/me - should return current user', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.email).toBe(testEmail)
    }, 15000)

    it('GET /users/me - should fail without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')

      expect(res.status).toBe(401)
    }, 15000)

    it('PATCH /users/me - should update profile', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })

      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('Updated Name')
    }, 15000)
  })

  // ==================
  // ADS TESTS
  // ==================
  describe('Ads', () => {
    it('POST /ads - should create ad', async () => {
      const res = await request(app.getHttpServer())
        .post('/ads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Ad',
          body: 'Buy our amazing product!',
          platform: 'FACEBOOK',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.title).toBe('Test Ad')
      adId = res.body.data.id
    }, 15000)

    it('GET /ads - should return all ads', async () => {
      const res = await request(app.getHttpServer())
        .get('/ads')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toBeInstanceOf(Array)
    }, 15000)

    it('GET /ads/:id - should return single ad', async () => {
      const res = await request(app.getHttpServer())
        .get(`/ads/${adId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(adId)
    }, 15000)

    it('PATCH /ads/:id - should update ad', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/ads/${adId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Ad Title' })

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Updated Ad Title')
    }, 15000)

    it('POST /ads/:id/impression - should track impression', async () => {
      const res = await request(app.getHttpServer())
        .post(`/ads/${adId}/impression`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(300)
    }, 15000)

    it('POST /ads/:id/click - should track click', async () => {
      const res = await request(app.getHttpServer())
        .post(`/ads/${adId}/click`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(300)
    }, 15000)

    it('GET /ads/:id/analytics - should return analytics', async () => {
      const res = await request(app.getHttpServer())
        .get(`/ads/${adId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('clicks')
      expect(res.body.data).toHaveProperty('impressions')
      expect(res.body.data).toHaveProperty('views')
    }, 15000)
  })

  // ==================
  // CAMPAIGNS TESTS
  // ==================
  describe('Campaigns', () => {
    it('POST /campaigns - should create campaign', async () => {
      const res = await request(app.getHttpServer())
        .post('/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Campaign',
          description: 'My first test campaign',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.name).toBe('Test Campaign')
      campaignId = res.body.data.id
    }, 15000)

    it('GET /campaigns - should return all campaigns', async () => {
      const res = await request(app.getHttpServer())
        .get('/campaigns')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toBeInstanceOf(Array)
    }, 15000)

    it('GET /campaigns/:id - should return single campaign', async () => {
      const res = await request(app.getHttpServer())
        .get(`/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(campaignId)
    }, 15000)

    it('POST /campaigns/:id/ads/:adId - should add ad', async () => {
      const res = await request(app.getHttpServer())
        .post(`/campaigns/${campaignId}/ads/${adId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(300)
    }, 15000)

    it('PATCH /campaigns/:id - should update campaign', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Campaign' })

      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('Updated Campaign')
    }, 15000)

    it('DELETE /campaigns/:id/ads/:adId - should remove ad', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/campaigns/${campaignId}/ads/${adId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(300)
    }, 15000)
  })

  // ==================
  // CLEANUP
  // ==================
  describe('Cleanup', () => {
    it('DELETE /ads/:id - should delete ad', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/ads/${adId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(300)
    }, 15000)

    it('DELETE /campaigns/:id - should delete campaign', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(300)
    }, 15000)

    it('DELETE /users/me - should delete account', async () => {
      const res = await request(app.getHttpServer())
        .delete('/users/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBeGreaterThanOrEqual(200)
      expect(res.status).toBeLessThan(300)
    }, 15000)
  })
})