'use strict';
const InMemoryUserRepository = require('../../../../src/infrastructure/persistence/InMemoryUserRepository');

describe('InMemoryUserRepository', () => {
  test('create list count pagination', async () => {
    const repo = new InMemoryUserRepository();
    for (let i = 0; i < 5; i++) {
      await repo.create({
        id: String(i),
        name: `U${i}`,
        email: `u${i}@ex.com`,
        createdAt: new Date(),
      });
    }
    const list = await repo.list({ offset: 1, limit: 2 });
    expect(list).toHaveLength(2);
    const count = await repo.count();
    expect(count).toBe(5);
  });
});
