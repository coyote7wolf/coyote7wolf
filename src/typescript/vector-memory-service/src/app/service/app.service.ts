import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  embedding(body: any) {
    return { data: [{ embedding: [0.1, 0.2, 0.3] }] };
  }

  search(body: any) {
    return { matches: [{ id: "doc1", score: 0.98 }] };
  }

  health() {
    return { status: "ok" };
  }
}
