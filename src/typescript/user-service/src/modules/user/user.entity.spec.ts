import { User } from "./user.entity";

describe("User Entity", () => {
  it("should set default values", () => {
    const user = new User();
    expect(user.id).toBe("");
    expect(user.name).toBe("");
    expect(user.status).toBe("active");
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("should assign values from init", () => {
    const now = new Date();
    const user = new User({
      id: "1",
      name: "A",
      email: "a@b.com",
      role: "admin",
      status: "inactive",
      createdAt: now,
    });
    expect(user.id).toBe("1");
    expect(user.name).toBe("A");
    expect(user.email).toBe("a@b.com");
    expect(user.role).toBe("admin");
    expect(user.status).toBe("inactive");
    expect(user.createdAt).toBe(now);
  });
});
