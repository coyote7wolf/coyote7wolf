import { Module, MiddlewareConsumer, DynamicModule } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserServiceMock } from "./user.service.mock";
import { UserRepository } from "./user.repository";
import { UserRepositoryMock } from "./user.repository.mock";
import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";
import { RoleServiceMock } from "./role.service.mock";
import { RoleRepository } from "./role.repository";
import { RoleRepositoryMock } from "./role.repository.mock";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";
import { DeviceServiceMock } from "./device.service.mock";
import { DeviceRepository } from "./device.repository";
import { DeviceRepositoryMock } from "./device.repository.mock";
import { MockAuthMiddleware } from "./mock-auth.middleware";

@Module({})
export class UserModule {
  static forRoot(env: string): DynamicModule {
    const isMock = env === "mock";
    return {
      module: UserModule,
      controllers: [UserController, RoleController, DeviceController],
      providers: [
        isMock
          ? { provide: UserService, useClass: UserServiceMock }
          : UserService,
        isMock
          ? { provide: UserRepository, useClass: UserRepositoryMock }
          : UserRepository,
        isMock
          ? { provide: RoleService, useClass: RoleServiceMock }
          : RoleService,
        isMock
          ? { provide: RoleRepository, useClass: RoleRepositoryMock }
          : RoleRepository,
        isMock
          ? { provide: DeviceService, useClass: DeviceServiceMock }
          : DeviceService,
        isMock
          ? { provide: DeviceRepository, useClass: DeviceRepositoryMock }
          : DeviceRepository,
      ],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MockAuthMiddleware)
      .forRoutes(UserController, RoleController, DeviceController);
  }
}
