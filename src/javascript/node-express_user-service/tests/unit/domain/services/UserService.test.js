'use strict';
const { buildContainer } = require('../../../../src/container');

describe('UserService', () => {
  let container;
  let service;

  beforeEach(() => {
    container = buildContainer();
    service = container.resolve('userService');
  });

  test('create & get user', async () => {
    const created = await service.createUser({ name: 'Alice', email: 'alice@example.com' });
    expect(created.id).toBeDefined();
    const fetched = await service.getUser(created.id);
    expect(fetched.email).toBe('alice@example.com');
  });

  test('duplicate email rejected', async () => {
    await service.createUser({ name: 'Bob', email: 'bob@example.com' });
    await expect(
      service.createUser({ name: 'Other', email: 'bob@example.com' }),
    ).rejects.toHaveProperty('code', 'CONFLICT');
  });

  test('delete user', async () => {
    const u = await service.createUser({ name: 'Del', email: 'del@example.com' });
    await service.deleteUser(u.id);
    await expect(service.getUser(u.id)).rejects.toHaveProperty('code', 'NOT_FOUND');
  });
});
