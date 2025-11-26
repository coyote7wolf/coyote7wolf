// mock_sse.ts
export interface ISSE {
  emit(event: string, data: any): void;
}

export class MockSSE implements ISSE {
  emit(event: string, data: any) {
    // no-op mock
  }
}
