import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";
import { RoleRepository } from "./role.repository";

class TestRoleService extends RoleService {
  constructor() {
    super(new RoleRepository());
  }
}

describe("RoleController error branches", () => {
  let controller: RoleController;
  let service: TestRoleService;
  beforeEach(() => {
    service = new TestRoleService();
    controller = new RoleController(service);
  });

  it("batch create >100 returns limit error", () => {
    const big = Array.from({ length: 101 }, (_, i) => ({ name: "r" + i }));
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
    const res = controller.batchUpdate([{ id: "no-role", name: "R" }]);
    expect(res[0]).toEqual({
      error: "Role not found",
      id: "no-role",
      status: "fail",
    });
  });

  it("batch partial patch with non-existent id returns not found", () => {
    const res = controller.batchPartialUpdate([
      { id: "absent", data: { name: "ZZ" } },
    ]);
    expect(res[0]).toEqual({
      error: "Role not found",
      id: "absent",
      status: "fail",
    });
  });

  it("partialUpdate single route non-existent id returns not found", () => {
    const res = controller.partialUpdate("gone", { name: "RR" });
    expect(res).toEqual({
      error: "Role not found",
      id: "gone",
      status: "fail",
    });
  });

  it("update single route non-existent id returns undefined", () => {
    const res = controller.update("missing", { name: "AB", description: "D" });
    expect(res).toBeUndefined();
  });

  it("delete single route non-existent id returns success false", () => {
    const res = controller.delete("missing");
    expect(res).toEqual({ success: false });
  });
});
