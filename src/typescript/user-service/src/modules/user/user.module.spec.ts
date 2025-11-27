import { Test } from "@nestjs/testing";
import { UserModule } from "./user.module";
import { UserService } from "./user.service";
import { UserServiceMock } from "./user.service.mock";
import { RoleService } from "./role.service";
import { RoleServiceMock } from "./role.service.mock";
import { DeviceService } from "./device.service";
import { DeviceServiceMock } from "./device.service.mock";

describe("UserModule dynamic providers", () => {
  it("uses mock classes when env=mock", async () => {
    const modRef = await Test.createTestingModule({
      imports: [UserModule.forRoot("mock")],
    }).compile();
    expect(modRef.get(UserService)).toBeInstanceOf(UserServiceMock);
    expect(modRef.get(RoleService)).toBeInstanceOf(RoleServiceMock);
    expect(modRef.get(DeviceService)).toBeInstanceOf(DeviceServiceMock);
  });

  it("uses real classes when env!=mock", async () => {
    const modRef = await Test.createTestingModule({
      imports: [UserModule.forRoot("real")],
    }).compile();
    expect(modRef.get(UserService)).not.toBeInstanceOf(UserServiceMock);
    expect(modRef.get(RoleService)).not.toBeInstanceOf(RoleServiceMock);
    expect(modRef.get(DeviceService)).not.toBeInstanceOf(DeviceServiceMock);
  });
});
