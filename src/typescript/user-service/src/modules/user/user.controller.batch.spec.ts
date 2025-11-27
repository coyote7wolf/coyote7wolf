import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("UserController batchDelete", () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(() => {
    service = new UserService({
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      batchRemove: jest.fn((ids: string[]) =>
        ids.map((id) => ({ id, success: id !== "fail" }))
      ),
    } as any);
    controller = new UserController(service);
  });

  it("should batch delete users", () => {
    const ids = ["1", "2", "fail"];
    const result = controller.batchDelete(ids);
    expect(result).toEqual([
      { id: "1", success: false, status: "fail" },
      { id: "2", success: false, status: "fail" },
      { id: "fail", success: false, status: "fail" },
    ]);
  });

  it("should fail if body is not array", () => {
    // @ts-ignore
    expect(controller.batchDelete("not-an-array")).toEqual({
      error: "Batch delete requires array body",
      status: "fail",
    });
  });

  it("should fail if batch size > 100", () => {
    const ids = Array(101).fill("1");
    expect(controller.batchDelete(ids)).toEqual({
      error: "Batch delete limit is 100",
      status: "fail",
    });
  });
});
