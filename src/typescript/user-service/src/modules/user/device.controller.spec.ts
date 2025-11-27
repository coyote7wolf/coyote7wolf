import { Test, TestingModule } from "@nestjs/testing";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";

describe("DeviceController", () => {
  let controller: DeviceController;
  let service: DeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        {
          provide: DeviceService,
          useValue: {
            getAll: jest.fn().mockReturnValue({ items: [] }),
            getByUserId: jest
              .fn()
              .mockReturnValue([{ id: "1", userId: "u1", name: "dev1" }]),
            getById: jest
              .fn()
              .mockReturnValue({ id: "1", userId: "u1", name: "dev1" }),
            create: jest.fn().mockImplementation((userId, name, type) => ({
              id: "2",
              userId,
              name,
              type,
            })),
            update: jest
              .fn()
              .mockImplementation((id, name, type) => ({ id, name, type })),
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
    controller = module.get<DeviceController>(DeviceController);
    service = module.get<DeviceService>(DeviceService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should get all devices", () => {
    expect(controller.getAll()).toEqual([]);
  });

  it("should get devices by userId", () => {
    expect(controller.getByUserId("u1")).toEqual([
      { id: "1", userId: "u1", name: "dev1" },
    ]);
  });

  it("should get device by id", () => {
    expect(controller.getById("1")).toEqual({
      id: "1",
      userId: "u1",
      name: "dev1",
    });
  });

  it("should create device", () => {
    expect(
      controller.create({ userId: "u1", name: "dev2", type: "phone" })
    ).toEqual({
      id: "2",
      userId: "u1",
      name: "dev2",
      type: "phone",
      status: "success",
    });
  });

  it("should update device", () => {
    expect(controller.update("1", { name: "dev3", type: "tablet" })).toEqual({
      id: "1",
      name: "dev3",
      type: "tablet",
    });
  });

  it("should delete device", () => {
    expect(controller.delete("1")).toEqual({ success: true });
  });
  it("should batch update devices", () => {
    const devices = [
      { id: "1", name: "A-upd", type: "phone" },
      { id: "2", name: "B-upd", type: "tablet" },
    ];
    controller["service"].update = jest
      .fn()
      .mockImplementation((id, name, type) => ({ id, name, type }));
    const result = controller.batchUpdate(devices);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("status");
    expect(result[1]).toHaveProperty("status");
  });
  describe("batchDelete", () => {
    it("should batch delete devices", () => {
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
    it("should patch a single device", () => {
      const id = "1";
      const patch = { name: "patched" };
      const result = controller.partialUpdate(id, patch);
      expect(result).toMatchObject({ id, name: "patched", status: "success" });
    });

    it("should batch patch devices", () => {
      const items = [
        { id: "1", data: { name: "A-patch" } },
        { id: "2", data: { type: "tablet" } },
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
        type: "tablet",
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
