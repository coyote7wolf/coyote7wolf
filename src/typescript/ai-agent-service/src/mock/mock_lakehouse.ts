// mock_lakehouse.ts
export interface ILakehouse {
  save(data: any): Promise<void>;
}

export class MockLakehouse implements ILakehouse {
  private store: any[] = [];
  async save(data: any) {
    this.store.push(data);
  }
}
