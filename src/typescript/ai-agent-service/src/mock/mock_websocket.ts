// mock_websocket.ts
export interface IWebSocket {
  send(event: string, data: any): void;
}

export class MockWebSocket implements IWebSocket {
  send(event: string, data: any) {
    // no-op mock
  }
}
