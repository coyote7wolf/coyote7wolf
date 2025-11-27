import { RoleRepository } from "./role.repository";

describe("RoleRepository", () => {
  let repo: RoleRepository;
  beforeEach(() => {
    repo = new RoleRepository();
  });

  it("create and findById works", () => {
    const r = repo.create("admin", "all");
    expect(r.id).toBeDefined();
    expect(repo.findById(r.id)).toEqual(r);
  });

  it("update changes fields", () => {
    const r = repo.create("user", "basic");
    const upd = repo.update(r.id, "power", "pro");
    expect(upd?.name).toBe("power");
    expect(upd?.description).toBe("pro");
  });

  it("partialUpdate selectively updates", () => {
    const r = repo.create("guest", "read");
    repo.partialUpdate(r.id, { description: "read-write" });
    expect(repo.findById(r.id)?.name).toBe("guest");
    expect(repo.findById(r.id)?.description).toBe("read-write");
  });

  it("delete removes role", () => {
    const r = repo.create("temp");
    expect(repo.delete(r.id)).toBe(true);
    expect(repo.findById(r.id)).toBeUndefined();
  });

  it("delete returns false for missing id", () => {
    expect(repo.delete("missing")).toBe(false);
  });
});
