import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";
import { DeviceRepository } from "./device.repository";

class TestDeviceService extends DeviceService {
  constructor() {
    super(new DeviceRepository());
  }
}

describe("DeviceController error branches", () => {
  let controller: DeviceController;
  let service: TestDeviceService;
  beforeEach(() => {
    service = new TestDeviceService();
    controller = new DeviceController(service);
  });

  it("batch create >100 returns limit error", () => {
    const big = Array.from({ length: 101 }, (_, i) => ({
      userId: "u",
      name: "n" + i,
    }));
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
      name: "x",
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
    const res = controller.batchUpdate([{ id: "does-not-exist", name: "X" }]);
    expect(res[0]).toEqual({
      error: "Device not found",
      id: "does-not-exist",
      status: "fail",
    });
  });

  it("batch partial patch with non-existent id returns not found", () => {
    const res = controller.batchPartialUpdate([
      { id: "nope", data: { name: "Z" } },
    ]);
    expect(res[0]).toEqual({
      error: "Device not found",
      id: "nope",
      status: "fail",
    });
  });

  it("partialUpdate single route with non-existent id returns not found", () => {
    const res = controller.partialUpdate("missing-id", { name: "Y" });
    expect(res).toEqual({
      error: "Device not found",
      id: "missing-id",
      status: "fail",
    });
  });

  it("update single route with non-existent id returns undefined", () => {
    const res = controller.update("missing-id", { name: "ABC" });
    expect(res).toBeUndefined();
  });

  it("delete single route with non-existent id returns success false", () => {
    const res = controller.delete("missing-id");
    expect(res).toEqual({ success: false });
  });
});
