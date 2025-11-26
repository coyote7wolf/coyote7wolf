import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  trigger(body: any) {
    return { status: "ok", result: { mock: true } };
  }

  mockEvent(body: any) {
    return { status: "ok", event: "mock-event" };
  }
}
