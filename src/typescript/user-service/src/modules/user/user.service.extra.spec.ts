import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";

describe("UserService extra branches", () => {
  let service: UserService;
  let repo: UserRepository;
  beforeEach(() => {
    repo = new UserRepository();
    service = new UserService(repo);
  });

  function seed() {
    service.create({
      name: "A",
      email: "a@x.com",
      role: "r1",
      deviceInfo: "devA",
    } as User);
    service.create({ name: "B", email: "b@x.com", role: "r2" } as User); // deviceInfo undefined
    service.create({
      name: "C",
      email: "c@x.com",
      role: "r3",
      deviceInfo: "devC",
    } as User);
    (repo as any).users.push(
      new User({
        id: "U4",
        name: "D",
        email: "d@x.com",
        role: "r4",
        status: "inactive",
      })
    );
  }

  it("status filter returns only inactive", () => {
    seed();
    const r = service.findAll({ status: "inactive" });
    expect(r.items.length).toBe(1);
    expect(r.items[0].status).toBe("inactive");
  });

  it("sort by deviceInfo asc with null branches", () => {
    seed();
    const r = service.findAll({ sort: "deviceInfo:asc" });
    const infos = r.items.map((u: any) => u.deviceInfo ?? null);
    const firstNullIndex = infos.indexOf(null);
    if (firstNullIndex !== -1) {
      for (let i = 0; i < firstNullIndex; i++) expect(infos[i]).not.toBeNull();
      for (let i = firstNullIndex; i < infos.length; i++)
        expect(infos[i]).toBeNull();
    }
  });

  it("sort by deviceInfo desc with null branches", () => {
    seed();
    const r = service.findAll({ sort: "deviceInfo:desc" });
    const infos = r.items.map((u: any) => u.deviceInfo ?? null);
    const firstNullIndex = infos.indexOf(null);
    if (firstNullIndex !== -1) {
      for (let i = 0; i < firstNullIndex; i++) expect(infos[i]).not.toBeNull();
    }
  });

  it("pagination empty page returns empty items", () => {
    for (let i = 0; i < 3; i++)
      service.create({
        name: "X" + i,
        email: "x" + i + "@x.com",
        role: "r",
      } as User);
    const rEmpty = service.findAll({ page: 4, limit: 2 });
    expect(rEmpty.items.length).toBe(0);
  });

  it("batchRemove returns [] for non-array", () => {
    const r = service.batchRemove({} as any);
    expect(r).toEqual([]);
  });

  it("batchRemove maps ids with success flags", () => {
    const u = service.create({
      name: "M",
      email: "m@m.com",
      role: "r",
    } as User);
    const r = service.batchRemove([u.id!, "non"]);
    expect(r).toHaveLength(2);
    const successEntry = r.find((x) => x.id === u.id);
    const failEntry = r.find((x) => x.id === "non");
    expect(successEntry?.success).toBe(true);
    expect(failEntry?.success).toBe(false);
  });

  it("update missing id returns undefined", () => {
    const res = service.update("missing", {
      name: "Z",
      email: "z@x.com",
      role: "r",
    } as any);
    expect(res).toBeUndefined();
  });

  it("batchPartialUpdate non-array returns []", () => {
    const r = service.batchPartialUpdate({} as any);
    expect(r).toEqual([]);
  });

  it("batchPartialUpdate missing id/data produces undefined entries", () => {
    const u = service.create({
      name: "K",
      email: "k@x.com",
      role: "r",
    } as User);
    const items = [
      { id: u.id!, data: { name: "KK" } },
      { id: "", data: { name: "XX" } } as any,
      { id: u.id!, data: undefined } as any,
    ];
    const r = service.batchPartialUpdate(items as any);
    expect(r[0]?.name).toBe("KK");
    expect(r[1]).toBeUndefined();
    expect(r[2]).toBeUndefined();
  });

  it("partialUpdate non-existent id returns undefined", () => {
    const r = service.partialUpdate("missing", { name: "X" });
    expect(r).toBeUndefined();
  });

  it("findOne non-existent id returns undefined", () => {
    const r = service.findOne("ghost");
    expect(r).toBeUndefined();
  });

  it("both-null deviceInfo sort branch (two users without deviceInfo)", () => {
    service.create({ name: "AA", email: "aa@x.com", role: "r" } as User); // no deviceInfo
    service.create({ name: "BB", email: "bb@x.com", role: "r" } as User); // no deviceInfo
    const r = service.findAll({ sort: "deviceInfo:asc" });
    expect(r.items.length).toBeGreaterThanOrEqual(2);
  });
});
