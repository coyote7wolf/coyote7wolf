import { RoleService } from "./role.service";
import { RoleRepository } from "./role.repository";
import { Role } from "./role.entity";

describe("RoleService", () => {
  let repo: RoleRepository;
  let service: RoleService;

  beforeEach(() => {
    repo = new RoleRepository();
    service = new RoleService(repo);
  });

  it("should filter by name", () => {
    repo.create("admin", "desc");
    repo.create("user", "desc");
    const result = service.getAll({ name: "admin" });
    expect(result.items.every((r: Role) => r.name.includes("admin"))).toBe(
      true
    );
  });

  it("should filter by status", () => {
    const r1 = repo.create("admin", "desc");
    r1.status = "active";
    const r2 = repo.create("user", "desc");
    r2.status = "inactive";
    const result = service.getAll({ status: "inactive" });
    expect(result.items.every((r: Role) => r.status === "inactive")).toBe(true);
  });

  it("should sort by createdAt desc", () => {
    const r1 = repo.create("admin", "desc");
    r1.createdAt = new Date(1);
    const r2 = repo.create("user", "desc");
    r2.createdAt = new Date(2);
    const result = service.getAll({ sort: "createdAt:desc" });
    expect(result.items[0].createdAt.getTime()).toBeGreaterThanOrEqual(
      result.items[1].createdAt.getTime()
    );
  });

  it("should paginate", () => {
    for (let i = 0; i < 30; i++) repo.create("role" + i, "desc");
    const result = service.getAll({ page: 2, limit: 10 });
    expect(result.items.length).toBe(10);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });
});
