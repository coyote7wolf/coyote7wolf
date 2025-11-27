import { DeviceService } from "./device.service";
import { DeviceRepository } from "./device.repository";

describe("DeviceService branch paths", () => {
  let service: DeviceService;
  beforeEach(() => {
    service = new DeviceService(new DeviceRepository());
    service.create("u1", "A", "phone");
    service.create("u1", "B", "tablet");
    service.create("u2", "C", "phone");
  });

  it("filters by userId", () => {
    const r = service.getAll({ userId: "u1" });
    expect(r.items.every((d: any) => d.userId === "u1")).toBe(true);
  });

  it("filters by type", () => {
    const r = service.getAll({ type: "phone" });
    expect(r.items.every((d: any) => d.type === "phone")).toBe(true);
  });

  it("sorts by name asc", () => {
    const r = service.getAll({ sort: "name:asc" });
    const names = r.items.map((d: any) => d.name);
    expect([...names].sort()).toEqual(names);
  });

  it("sorts by name desc", () => {
    const r = service.getAll({ sort: "name:desc" });
    const names = r.items.map((d: any) => d.name);
    expect([...names].sort().reverse()).toEqual(names);
  });

  it("paginates correctly", () => {
    const r = service.getAll({ page: 1, limit: 2, sort: "name:asc" });
    expect(r.items.length).toBe(2);
    const r2 = service.getAll({ page: 2, limit: 2, sort: "name:asc" });
    expect(r2.items.length).toBeGreaterThanOrEqual(1);
  });
});
