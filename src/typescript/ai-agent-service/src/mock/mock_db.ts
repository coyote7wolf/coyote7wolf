// mock_db.ts
export interface IDatabase {
  createTask(data: any): Promise<any>;
  getTaskById(id: string): Promise<any>;
  logAction(data: any): Promise<void>;
}

export class MockDB implements IDatabase {
  private tasks = new Map<string, any>();
  private logs: any[] = [];

  async createTask(data: any) {
    const id =
      data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const task = { ...data, id };
    this.tasks.set(id, task);
    return { ...task, taskId: id };
  }

  async getTaskById(id: string): Promise<any> {
    return this.tasks.get(id);
  }

  async logAction(data: any): Promise<void> {
    this.logs.push(data);
  }
}
