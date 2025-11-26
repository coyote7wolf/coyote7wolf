// mock_mq.ts
export interface IMQ {
  publish(topic: string, message: any): Promise<void>;
}

export class MockMQ implements IMQ {
  private messages: any[] = [];
  async publish(topic: string, message: any) {
    this.messages.push({ topic, message });
  }
}
