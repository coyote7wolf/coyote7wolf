import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";

describe("UserService", () => {
  let service: UserService;
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
    service = new UserService(repo);
  });

  it("should create and find user", () => {
    const user: User = { name: "B", email: "b@b.com", role: "admin" };
    const created = service.create(user);
    expect(created.name).toBe("B");
    expect(service.findOne(created.id!)).toEqual(created);
  });

  it("should update user", () => {
    const user: User = { name: "C", email: "c@b.com", role: "user" };
    const created = service.create(user);
    const updated = service.update(created.id!, { ...created, name: "CC" });
    expect(updated?.name).toBe("CC");
  });

  it("should remove user", () => {
    const user: User = { name: "D", email: "d@b.com", role: "user" };
    const created = service.create(user);
    expect(service.remove(created.id!)).toBe(true);
    expect(service.findOne(created.id!)).toBeUndefined();
  });

  it("should filter by role", () => {
    repo.create({ id: "1", name: "A", role: "admin" } as any);
    repo.create({ id: "2", name: "B", role: "user" } as any);
    const result = service.findAll({ role: "admin" });
    expect(result.items.every((u: User) => u.role === "admin")).toBe(true);
  });

  it("should filter by status", () => {
    repo.create({ id: "1", name: "A", status: "active" } as any);
    repo.create({ id: "2", name: "B", status: "inactive" } as any);
    const result = service.findAll({ status: "inactive" });
    expect(result.items.every((u: User) => u.status === "inactive")).toBe(true);
  });

  it("should sort by createdAt desc", () => {
    const u1 = repo.create({
      id: "1",
      name: "A",
      createdAt: new Date(1),
    } as any);
    const u2 = repo.create({
      id: "2",
      name: "B",
      createdAt: new Date(2),
    } as any);
    const result = service.findAll({ sort: "createdAt:desc" });
    expect(result.items[0].createdAt.getTime()).toBeGreaterThanOrEqual(
      result.items[1].createdAt.getTime()
    );
  });

  it("should paginate", () => {
    for (let i = 0; i < 30; i++)
      repo.create({ id: String(i), name: "U" + i } as any);
    const result = service.findAll({ page: 2, limit: 10 });
    expect(result.items.length).toBe(10);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });
});
