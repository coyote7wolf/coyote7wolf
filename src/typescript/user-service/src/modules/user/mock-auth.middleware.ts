import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class MockAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 模擬驗證，未來可串接 syncCoreAI-auth-service
    const token = req.headers["authorization"];
    if (!token || token !== "Bearer mock-token") {
      return res.status(401).json({ message: "Unauthorized (mock)" });
    }
    next();
  }
}
