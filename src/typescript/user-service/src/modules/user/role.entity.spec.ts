import { Role } from "./role.entity";

describe("Role Entity", () => {
  it("should set default values", () => {
    const role = new Role();
    expect(role.id).toBe("");
    expect(role.name).toBe("");
    expect(role.status).toBe("active");
    expect(role.createdAt).toBeInstanceOf(Date);
  });

  it("should assign values from init", () => {
    const now = new Date();
    const role = new Role({
      id: "1",
      name: "admin",
      description: "desc",
      status: "inactive",
      createdAt: now,
    });
    expect(role.id).toBe("1");
    expect(role.name).toBe("admin");
    expect(role.description).toBe("desc");
    expect(role.status).toBe("inactive");
    expect(role.createdAt).toBe(now);
  });
});
