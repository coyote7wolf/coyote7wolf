import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./user.entity";

describe("UserController", () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockReturnValue({ items: [] }),
            findOne: jest.fn().mockReturnValue(undefined),
            create: jest.fn().mockImplementation((u) => u),
            update: jest.fn().mockImplementation((id, u) => ({ ...u, id })),
            remove: jest.fn().mockReturnValue(true),
            batchRemove: jest.fn((ids: string[]) =>
              ids.map((id) => ({ id, success: id !== "fail" }))
            ),
            partialUpdate: jest.fn((id, data) => ({ id, ...data })),
            batchPartialUpdate: jest.fn((items) =>
              items.map((item: any) => ({ id: item.id, ...item.data }))
            ),
          },
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return empty array for findAll", () => {
    expect(controller.findAll()).toEqual([]);
  });

  it("should create a user", () => {
    const user: User = { name: "A", email: "a@b.com", role: "user" };
    expect(controller.create(user)).toEqual({ ...user, status: "success" });
  });
  it("should batch update users", () => {
    const users = [
      { id: "1", name: "A-upd", email: "a@b.com", role: "user" },
      { id: "2", name: "B-upd", email: "b@b.com", role: "admin" },
    ];
    // mock update 回傳物件
    controller["userService"].update = jest
      .fn()
      .mockImplementation((id, u) => ({ ...u, id }));
    const result = controller.batchUpdate(users);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("status");
    expect(result[1]).toHaveProperty("status");
  });
  describe("batchDelete", () => {
    it("should batch delete users", () => {
      const ids = ["1", "2", "fail"];
      const result = controller.batchDelete(ids);
      expect(result).toEqual([
        { id: "1", success: true, status: "success" },
        { id: "2", success: true, status: "success" },
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
  });

  describe("PATCH endpoints", () => {
    it("should patch a single user", () => {
      const id = "1";
      const patch = { name: "patched" };
      const result = controller.partialUpdate(id, patch);
      expect(result).toMatchObject({ id, name: "patched", status: "success" });
    });

    it("should batch patch users", () => {
      const items = [
        { id: "1", data: { name: "A-patch" } },
        { id: "2", data: { email: "b@patch.com" } },
      ];
      const result = controller.batchPartialUpdate(items);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toMatchObject({
        id: "1",
        name: "A-patch",
        status: "success",
      });
      expect(result[1]).toMatchObject({
        id: "2",
        email: "b@patch.com",
        status: "success",
      });
    });

    it("should fail batch patch if not array", () => {
      // @ts-ignore
      expect(controller.batchPartialUpdate("not-an-array")).toEqual({
        error: "Batch patch requires array body",
        status: "fail",
      });
    });

    it("should fail batch patch if batch size > 100", () => {
      const items = Array(101).fill({ id: "1", data: { name: "A" } });
      expect(controller.batchPartialUpdate(items)).toEqual({
        error: "Batch patch limit is 100",
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
});
