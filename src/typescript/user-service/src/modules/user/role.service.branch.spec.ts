import { RoleService } from "./role.service";
import { RoleRepository } from "./role.repository";

describe("RoleService branch paths", () => {
  let service: RoleService;
  beforeEach(() => {
    service = new RoleService(new RoleRepository());
    service.create("admin", "full");
    service.create("user", "limited");
    service.create("guest", "read");
  });

  it("filter by name", () => {
    const r = service.getAll({ name: "admin" });
    expect(r.items).toHaveLength(1);
    expect(r.items[0].name).toBe("admin");
  });

  it("sort asc by name", () => {
    const r = service.getAll({ sort: "name:asc" });
    const names = r.items.map((x: any) => x.name);
    expect([...names].sort()).toEqual(names);
  });

  it("sort desc by name", () => {
    const r = service.getAll({ sort: "name:desc" });
    const names = r.items.map((x: any) => x.name);
    expect([...names].sort().reverse()).toEqual(names);
  });

  it("pagination works", () => {
    const r1 = service.getAll({ page: 1, limit: 2, sort: "name:asc" });
    expect(r1.items.length).toBe(2);
    const r2 = service.getAll({ page: 2, limit: 2, sort: "name:asc" });
    expect(r2.items.length).toBeGreaterThanOrEqual(1);
  });
});
