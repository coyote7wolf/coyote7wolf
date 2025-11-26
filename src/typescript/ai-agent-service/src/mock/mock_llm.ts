// mock_llm.ts
export interface ILLM {
  generate(taskType: string, params: any): Promise<string>;
}

export class MockLLM implements ILLM {
  async generate(taskType: string, params: any) {
    if (taskType === "suggestion") return "這是建議內容";
    if (taskType === "summary") return "這是摘要內容";
    if (taskType === "fix") return "這是修正內容";
    if (taskType === "conflict") return "這是衝突解釋";
    return "mock result";
  }
}
