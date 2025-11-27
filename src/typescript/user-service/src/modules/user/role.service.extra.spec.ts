import { RoleService } from "./role.service";
import { RoleRepository } from "./role.repository";
import { Role } from "./role.entity";

describe("RoleService extra branches", () => {
  let service: RoleService;
  let repo: RoleRepository;
  beforeEach(() => {
    repo = new RoleRepository();
    service = new RoleService(repo);
  });

  function seed() {
    service.create("admin", "full");
    service.create("user"); // description undefined
    service.create("guest", "read");
    // add inactive role
    (repo as any).roles.push(
      new Role({ id: "Z", name: "other", status: "inactive" })
    );
  }

  it("status filter returns only inactive roles", () => {
    seed();
    const r = service.getAll({ status: "inactive" });
    expect(r.items.length).toBe(1);
    expect(r.items[0].status).toBe("inactive");
  });

  it("name substring filter includes partial match branch", () => {
    seed();
    const r = service.getAll({ name: "adm" });
    expect(r.items.length).toBe(1);
    expect(r.items[0].name).toBe("admin");
  });

  it("sort by description asc with undefined values triggers null branches", () => {
    seed();
    const r = service.getAll({ sort: "description:asc" });
    const descs = r.items.map((x: any) => x.description ?? null);
    const firstNullIndex = descs.indexOf(null);
    if (firstNullIndex !== -1) {
      for (let i = 0; i < firstNullIndex; i++) expect(descs[i]).not.toBeNull();
      for (let i = firstNullIndex; i < descs.length; i++)
        expect(descs[i]).toBeNull();
    }
  });

  it("pagination empty page returns empty items", () => {
    seed();
    const rEmpty = service.getAll({ page: 5, limit: 2 });
    expect(rEmpty.items.length).toBe(0);
  });

  it("batchPartialUpdate returns [] for non-array", () => {
    const r = service.batchPartialUpdate({} as any);
    expect(r).toEqual([]);
  });

  it("batchPartialUpdate missing id/data returns undefined entries", () => {
    const created = service.create("temp");
    const items = [
      { id: created.id, data: { name: "changed" } },
      { id: "", data: { name: "x" } } as any,
      { id: created.id, data: undefined } as any,
    ];
    const r = service.batchPartialUpdate(items as any);
    expect(r[0]?.name).toBe("changed");
    expect(r[1]).toBeUndefined();
    expect(r[2]).toBeUndefined();
  });

  it("batchDelete returns [] for non-array input", () => {
    const r = service.batchDelete({} as any);
    expect(r).toEqual([]);
  });

  it("batchDelete maps success including missing id", () => {
    const created = service.create("alpha");
    const result = service.batchDelete([created.id, "none"]);
    const successEntry = result.find((x) => x.id === created.id);
    const failEntry = result.find((x) => x.id === "none");
    expect(successEntry?.success).toBe(true);
    expect(failEntry?.success).toBe(false);
  });

  it("partialUpdate non-existent id returns undefined", () => {
    const r = service.partialUpdate("missing", { name: "Z" });
    expect(r).toBeUndefined();
  });

  it("both-null sort branch (two roles with undefined description)", () => {
    service.create("r1");
    service.create("r2");
    const r = service.getAll({ sort: "description:asc" });
    expect(Array.isArray(r.items)).toBe(true);
  });
});
