import { UserRepository } from "./user.repository";

describe("UserRepository negative branches", () => {
  let repo: UserRepository;
  beforeEach(() => {
    repo = new UserRepository();
  });

  it("update returns undefined for missing id", () => {
    // supply required properties for User type
    const res = repo.update("nope", {
      id: "nope",
      name: "X",
      email: "x@example.com",
      role: "user",
    } as any);
    expect(res).toBeUndefined();
  });

  it("partialUpdate returns undefined for missing id", () => {
    const res = repo.partialUpdate("nope", { name: "Y" });
    expect(res).toBeUndefined();
  });

  it("remove returns false for missing id", () => {
    const res = repo.remove("nope");
    expect(res).toBe(false);
  });

  it("update success then partialUpdate alters existing", () => {
    const created = repo.create({
      id: "ignored",
      name: "Jane",
      email: "jane@example.com",
      role: "user",
    } as any);
    expect(created.name).toBe("Jane");
    const updated = repo.update(created.id!, {
      id: created.id!,
      name: "Janet",
      email: "janet@example.com",
      role: "user",
    } as any);
    expect(updated?.name).toBe("Janet");
    const partially = repo.partialUpdate(created.id!, { name: "J" });
    expect(partially?.name).toBe("J");
  });
});
