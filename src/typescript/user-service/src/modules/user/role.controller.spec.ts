import { Test, TestingModule } from "@nestjs/testing";
import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";

describe("RoleController", () => {
  let controller: RoleController;
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            getAll: jest.fn().mockReturnValue({ items: [] }),
            getById: jest.fn().mockReturnValue({ id: "1", name: "admin" }),
            create: jest
              .fn()
              .mockImplementation((name, desc) => ({ id: "2", name, desc })),
            update: jest
              .fn()
              .mockImplementation((id, name, desc) => ({ id, name, desc })),
            delete: jest.fn().mockReturnValue({ success: true }),
            batchDelete: jest.fn((ids: string[]) =>
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
    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should get all roles", () => {
    expect(controller.getAll()).toEqual([]);
  });

  it("should get role by id", () => {
    expect(controller.getById("1")).toEqual({ id: "1", name: "admin" });
  });

  it("should create role", () => {
    expect(controller.create({ name: "user", description: "desc" })).toEqual({
      id: "2",
      name: "user",
      desc: "desc",
      status: "success",
    });
  });

  it("should update role", () => {
    expect(
      controller.update("1", { name: "user", description: "desc" })
    ).toEqual({ id: "1", name: "user", desc: "desc" });
  });

  it("should delete role", () => {
    expect(controller.delete("1")).toEqual({ success: true });
  });
  it("should batch update roles", () => {
    const roles = [
      { id: "1", name: "A-upd", description: "desc1" },
      { id: "2", name: "B-upd", description: "desc2" },
    ];
    controller["service"].update = jest
      .fn()
      .mockImplementation((id, name, desc) => ({ id, name, desc }));
    const result = controller.batchUpdate(roles);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("status");
    expect(result[1]).toHaveProperty("status");
  });
  describe("batchDelete", () => {
    it("should batch delete roles", () => {
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

    it("should fail if batch size > 100", () => {
      const ids = Array(101).fill("1");
      expect(controller.batchDelete(ids)).toEqual({
        error: "Batch delete limit is 100",
        status: "fail",
      });
    });
  });

  describe("PATCH endpoints", () => {
    it("should patch a single role", () => {
      const id = "1";
      const patch = { name: "patched" };
      const result = controller.partialUpdate(id, patch);
      expect(result).toMatchObject({ id, name: "patched", status: "success" });
    });

    it("should batch patch roles", () => {
      const items = [
        { id: "1", data: { name: "A-patch" } },
        { id: "2", data: { description: "desc-patch" } },
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
        description: "desc-patch",
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
  });
});
