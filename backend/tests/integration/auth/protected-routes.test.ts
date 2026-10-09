import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createUsersRepository } from '../../../src/modules/users/users.repository.js';
import {
  buildTestApp,
  protectedTestModule,
  tokenFor,
} from '../../helpers/app.js';
import { createTestPrisma, truncateAllTables } from '../../helpers/database.js';
import { errorOf } from '../../helpers/http.js';

const prisma = createTestPrisma();
const { app } = buildTestApp({
  authSubjects: createUsersRepository(prisma),
  v1Modules: [protectedTestModule],
});

beforeEach(async () => {
  await truncateAllTables(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('protected routes against PostgreSQL', () => {
  it('lets an admin through an admin-only route', async () => {
    const admin = await prisma.user.create({
      data: { phone: '+2348030000001', role: 'admin' },
    });

    const response = await request(app)
      .get('/api/v1/test-protected/admin')
      .set('Authorization', `Bearer ${await tokenFor(admin.id)}`)
      .expect(200);

    expect(response.body).toEqual({
      data: { userId: admin.id, role: 'admin' },
    });
  });

  it('blocks a customer from an admin-only route', async () => {
    const customer = await prisma.user.create({
      data: { phone: '+2348030000002' },
    });

    const response = await request(app)
      .get('/api/v1/test-protected/admin')
      .set('Authorization', `Bearer ${await tokenFor(customer.id)}`)
      .expect(403);

    expect(errorOf(response).code).toBe('FORBIDDEN');
  });

  it('applies a demotion immediately to an already-issued token', async () => {
    const user = await prisma.user.create({
      data: { phone: '+2348030000003', role: 'admin' },
    });
    const token = await tokenFor(user.id);
    await request(app)
      .get('/api/v1/test-protected/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'customer' },
    });

    await request(app)
      .get('/api/v1/test-protected/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('applies a suspension immediately to an already-issued token', async () => {
    const user = await prisma.user.create({
      data: { phone: '+2348030000004' },
    });
    const token = await tokenFor(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'suspended' },
    });

    const response = await request(app)
      .get('/api/v1/test-protected/any')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(errorOf(response).code).toBe('ACCOUNT_SUSPENDED');
  });

  it('rejects the token of a deleted user', async () => {
    const user = await prisma.user.create({
      data: { phone: '+2348030000005' },
    });
    const token = await tokenFor(user.id);
    await prisma.user.delete({ where: { id: user.id } });

    await request(app)
      .get('/api/v1/test-protected/any')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
