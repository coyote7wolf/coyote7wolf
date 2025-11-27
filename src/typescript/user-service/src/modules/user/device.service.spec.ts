import { DeviceService } from "./device.service";
import { DeviceRepository } from "./device.repository";
import { Device } from "./device.entity";

describe("DeviceService", () => {
  let repo: DeviceRepository;
  let service: DeviceService;

  beforeEach(() => {
    repo = new DeviceRepository();
    service = new DeviceService(repo);
  });

  it("should filter by userId", () => {
    repo.create("u1", "ipad", "tablet");
    repo.create("u2", "iphone", "phone");
    const result = service.getAll({ userId: "u1" });
    expect(result.items.every((d: Device) => d.userId === "u1")).toBe(true);
  });

  it("should filter by type", () => {
    repo.create("u1", "ipad", "tablet");
    repo.create("u2", "iphone", "phone");
    const result = service.getAll({ type: "tablet" });
    expect(result.items.every((d: Device) => d.type === "tablet")).toBe(true);
  });

  it("should filter by status", () => {
    const d1 = repo.create("u1", "ipad", "tablet");
    d1.status = "active";
    const d2 = repo.create("u2", "iphone", "phone");
    d2.status = "inactive";
    const result = service.getAll({ status: "inactive" });
    expect(result.items.every((d: Device) => d.status === "inactive")).toBe(
      true
    );
  });

  it("should sort by createdAt desc", () => {
    const d1 = repo.create("u1", "ipad", "tablet");
    d1.createdAt = new Date(1);
    const d2 = repo.create("u2", "iphone", "phone");
    d2.createdAt = new Date(2);
    const result = service.getAll({ sort: "createdAt:desc" });
    expect(result.items[0].createdAt.getTime()).toBeGreaterThanOrEqual(
      result.items[1].createdAt.getTime()
    );
  });

  it("should paginate", () => {
    for (let i = 0; i < 30; i++) repo.create("u" + i, "dev" + i, "type");
    const result = service.getAll({ page: 2, limit: 10 });
    expect(result.items.length).toBe(10);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });
});
