// mock_redis.ts
export interface IRedis {
  set(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
}

export class MockRedis implements IRedis {
  private store = new Map<string, any>();
  async set(key: string, value: any) {
    this.store.set(key, value);
  }
  async get(key: string) {
    return this.store.get(key);
  }
}
