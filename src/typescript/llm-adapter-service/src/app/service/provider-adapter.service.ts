import { Injectable } from "@nestjs/common";

@Injectable()
export class ProviderAdapterService {
  infer(provider: string, payload: any) {
    return { provider, result: "mock-infer" };
  }
  loraTrain(provider: string, payload: any) {
    return { provider, status: "started", job_id: "mock_job_id" };
  }
  fineTune(provider: string, payload: any) {
    return { provider, status: "started", job_id: "mock_job_id" };
  }
}
