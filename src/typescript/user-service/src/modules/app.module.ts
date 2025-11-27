import { Module, DynamicModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "../prisma/prisma.module";

// Ensure tests that import AppModule directly also get User/Role/Device controllers.
// We still allow main.ts to compose dynamically; duplicate import is harmless.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Attach UserModule with env-based mock/providers so smoke tests have routes
    UserModule.forRoot(process.env.NODE_ENV || "mock"),
  ],
})
export class AppModule {
  static forRoot(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        UserModule.forRoot(process.env.NODE_ENV || "mock"),
      ],
    };
  }
}
