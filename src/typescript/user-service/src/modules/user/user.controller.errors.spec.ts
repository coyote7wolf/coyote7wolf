import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";

class TestUserService extends UserService {
  constructor() {
    super(new UserRepository());
  }
}

describe("UserController error branches", () => {
  let controller: UserController;
  let service: TestUserService;
  beforeEach(() => {
    service = new TestUserService();
    controller = new UserController(service);
  });

  it("batch create >100 returns limit error", () => {
    const big = Array.from({ length: 101 }, (_, i) => ({ name: "u" + i }));
    const res = controller.create(big as any);
    expect(res).toEqual({ error: "Batch create limit is 100", status: "fail" });
  });

  it("batch update non-array returns error", () => {
    const res = controller.batchUpdate({} as any);
    expect(res).toEqual({
      error: "Batch update requires array body",
      status: "fail",
    });
  });

  it("batch update >100 returns limit error", () => {
    const big = Array.from({ length: 101 }, (_, i) => ({
      id: String(i),
      name: "X",
    }));
    const res = controller.batchUpdate(big as any);
    expect(res).toEqual({ error: "Batch update limit is 100", status: "fail" });
  });

  it("batch update missing id returns error entry", () => {
    const res = controller.batchUpdate([
      { id: "a", name: "X" },
      { name: "Y" } as any,
    ]);
    expect(res[1]).toEqual({ error: "Missing id", status: "fail" });
  });

  it("batch delete non-array returns error", () => {
    const res = controller.batchDelete("not" as any);
    expect(res).toEqual({
      error: "Batch delete requires array body",
      status: "fail",
    });
  });

  it("batch delete >100 returns limit error", () => {
    const big = Array.from({ length: 101 }, (_, i) => "id" + i);
    const res = controller.batchDelete(big);
    expect(res).toEqual({ error: "Batch delete limit is 100", status: "fail" });
  });

  it("batch partial patch non-array returns error", () => {
    const res = controller.batchPartialUpdate({} as any);
    expect(res).toEqual({
      error: "Batch patch requires array body",
      status: "fail",
    });
  });

  it("batch partial patch >100 returns limit error", () => {
    const big = Array.from({ length: 101 }, (_, i) => ({
      id: String(i),
      data: { name: "x" },
    }));
    const res = controller.batchPartialUpdate(big as any);
    expect(res).toEqual({ error: "Batch patch limit is 100", status: "fail" });
  });

  it("batch partial patch missing id or data returns error", () => {
    const res = controller.batchPartialUpdate([
      { id: "1", data: { name: "A" } },
      { id: "2" } as any,
      { data: { name: "B" } } as any,
    ]);
    expect(res[1]).toEqual({ error: "Missing id or data", status: "fail" });
    expect(res[2]).toEqual({ error: "Missing id or data", status: "fail" });
  });

  it("batch update with non-existent id returns not found", () => {
    const res = controller.batchUpdate([{ id: "nouser", name: "A" } as any]);
    expect(res[0]).toEqual({
      error: "User not found",
      id: "nouser",
      status: "fail",
    });
  });

  it("batch partial patch with non-existent id returns not found", () => {
    const res = controller.batchPartialUpdate([
      { id: "missing", data: { name: "B" } },
    ]);
    expect(res[0]).toEqual({
      error: "User not found",
      id: "missing",
      status: "fail",
    });
  });

  it("partialUpdate single route non-existent id returns not found", () => {
    const res = controller.partialUpdate("void", { name: "C" });
    expect(res).toEqual({
      error: "User not found",
      id: "void",
      status: "fail",
    });
  });

  it("update single route non-existent id returns undefined", () => {
    const res = controller.update("ghost", {
      name: "D",
      email: "d@x.com",
      role: "r",
    } as any);
    expect(res).toBeUndefined();
  });

  it("delete single route non-existent id returns success false", () => {
    const res = controller.remove("ghost");
    expect(res).toEqual({ success: false });
  });
});
