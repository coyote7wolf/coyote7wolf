import { Device } from "./device.entity";

describe("Device Entity", () => {
  it("should set default values", () => {
    const device = new Device();
    expect(device.id).toBe("");
    expect(device.userId).toBe("");
    expect(device.name).toBe("");
    expect(device.status).toBe("active");
    expect(device.createdAt).toBeInstanceOf(Date);
  });

  it("should assign values from init", () => {
    const now = new Date();
    const device = new Device({
      id: "1",
      userId: "u1",
      name: "ipad",
      type: "tablet",
      status: "inactive",
      createdAt: now,
    });
    expect(device.id).toBe("1");
    expect(device.userId).toBe("u1");
    expect(device.name).toBe("ipad");
    expect(device.type).toBe("tablet");
    expect(device.status).toBe("inactive");
    expect(device.createdAt).toBe(now);
  });
});
