import { DeviceRepository } from "./device.repository";

describe("DeviceRepository", () => {
  let repo: DeviceRepository;
  beforeEach(() => {
    repo = new DeviceRepository();
  });

  it("creates and finds device", () => {
    const created = repo.create("u1", "phone1", "phone");
    expect(created.id).toBeDefined();
    expect(repo.findById(created.id)).toEqual(created);
  });

  it("findByUserId filters correctly", () => {
    repo.create("u1", "d1");
    repo.create("u2", "d2");
    repo.create("u1", "d3");
    const list = repo.findByUserId("u1");
    expect(list).toHaveLength(2);
    expect(list.every((d) => d.userId === "u1")).toBe(true);
  });

  it("update modifies existing device", () => {
    const d = repo.create("u1", "orig", "phone");
    const updated = repo.update(d.id, "newName", "tablet");
    expect(updated).toBeDefined();
    expect(updated?.name).toBe("newName");
    expect(updated?.type).toBe("tablet");
  });

  it("partialUpdate updates only provided fields", () => {
    const d = repo.create("u1", "orig", "phone");
    const part = repo.partialUpdate(d.id, { name: "partial" });
    expect(part?.name).toBe("partial");
    expect(part?.type).toBe("phone");
  });

  it("delete removes device", () => {
    const d = repo.create("u1", "toDel");
    const ok = repo.delete(d.id);
    expect(ok).toBe(true);
    expect(repo.findById(d.id)).toBeUndefined();
  });

  it("delete returns false for missing id", () => {
    expect(repo.delete("nope")).toBe(false);
  });
});
