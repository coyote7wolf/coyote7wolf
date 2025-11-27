import { MockAuthMiddleware } from "./mock-auth.middleware";
import { Request, Response } from "express";

describe("MockAuthMiddleware", () => {
  let middleware: MockAuthMiddleware;
  beforeEach(() => {
    middleware = new MockAuthMiddleware();
  });

  function makeRes() {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    // @ts-ignore
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  }

  it("rejects missing token", () => {
    const req = { headers: {} } as Request;
    const res = makeRes();
    const next = jest.fn();
    middleware.use(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects wrong token", () => {
    const req = { headers: { authorization: "Bearer wrong" } } as Request;
    const res = makeRes();
    const next = jest.fn();
    middleware.use(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("passes with correct token", () => {
    const req = { headers: { authorization: "Bearer mock-token" } } as Request;
    const res = makeRes();
    const next = jest.fn();
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
