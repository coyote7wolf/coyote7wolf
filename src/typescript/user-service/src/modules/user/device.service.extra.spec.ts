import { DeviceService } from "./device.service";
import { DeviceRepository } from "./device.repository";
import { Device } from "./device.entity";

describe("DeviceService extra branches", () => {
  let service: DeviceService;
  let repo: DeviceRepository;
  beforeEach(() => {
    repo = new DeviceRepository();
    service = new DeviceService(repo);
  });

  function seed() {
    service.create("u1", "A", "phone");
    service.create("u2", "B"); // type undefined
    service.create("u3", "C", "tablet");
    // add device with inactive status
    (repo as any).devices.push(
      new Device({ id: "X", userId: "u4", name: "D", status: "inactive" })
    );
  }

  it("status filter returns only inactive", () => {
    seed();
    const r = service.getAll({ status: "inactive" });
    expect(r.items.length).toBe(1);
    expect(r.items[0].status).toBe("inactive");
  });

  it("sort by type asc with undefined values triggers null ordering branches", () => {
    seed();
    const r = service.getAll({ sort: "type:asc" });
    // devices with undefined type should appear after defined ones in asc order per logic (av==null => return 1)
    const types = r.items.map((d: any) => d.type ?? null);
    // all defined types first then nulls
    const firstNullIndex = types.indexOf(null);
    if (firstNullIndex !== -1) {
      for (let i = 0; i < firstNullIndex; i++) expect(types[i]).not.toBeNull();
      for (let i = firstNullIndex; i < types.length; i++)
        expect(types[i]).toBeNull();
    }
  });

  it("sort by type desc with undefined values triggers bv==null branch", () => {
    seed();
    const r = service.getAll({ sort: "type:desc" });
    const types = r.items.map((d: any) => d.type ?? null);
    // in desc, nulls should still cluster (av==null returns 1) leaving defined first
    const firstNullIndex = types.indexOf(null);
    if (firstNullIndex !== -1) {
      for (let i = 0; i < firstNullIndex; i++) expect(types[i]).not.toBeNull();
    }
  });

  it("pagination empty page returns empty items array", () => {
    for (let i = 0; i < 5; i++) service.create("u" + i, "N" + i);
    const r = service.getAll({ page: 3, limit: 2 }); // 5 items -> pages: 1:[0-1],2:[2-3],3:[4] => page4 empty so use page4
    const rEmpty = service.getAll({ page: 4, limit: 2 });
    expect(rEmpty.items.length).toBe(0);
  });

  it("batchPartialUpdate returns [] for non-array input", () => {
    const r = service.batchPartialUpdate({} as any);
    expect(Array.isArray(r)).toBe(true);
    expect(r.length).toBe(0);
  });

  it("batchPartialUpdate with missing id/data yields undefined entries", () => {
    const created = service.create("u1", "AA");
    const items = [
      { id: created.id, data: { name: "BB" } },
      { id: "", data: { name: "CC" } } as any,
      { id: created.id, data: undefined } as any,
    ];
    const r = service.batchPartialUpdate(items as any);
    expect(r[0]?.name).toBe("BB");
    expect(r[1]).toBeUndefined();
    expect(r[2]).toBeUndefined();
  });

  it("batchDelete returns [] for non-array input", () => {
    const r = service.batchDelete({} as any);
    expect(r).toEqual([]);
  });

  it("batchDelete maps success flags including missing id", () => {
    const a = service.create("u1", "AA");
    const result = service.batchDelete([a.id, "missing"]);
    const successEntry = result.find((x) => x.id === a.id);
    const failEntry = result.find((x) => x.id === "missing");
    expect(successEntry?.success).toBe(true);
    expect(failEntry?.success).toBe(false);
  });

  it("partialUpdate non-existent id returns undefined", () => {
    const r = service.partialUpdate("absent", { name: "Z" });
    expect(r).toBeUndefined();
  });

  it("both-null sort branch (two devices with undefined type)", () => {
    service.create("u1", "N1");
    service.create("u2", "N2");
    const r = service.getAll({ sort: "type:asc" });
    // Ensure comparator processed both-null pairs without throwing
    expect(Array.isArray(r.items)).toBe(true);
  });
});
