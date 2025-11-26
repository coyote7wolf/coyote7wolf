import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/module/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3602;

  await app.listen(port, "0.0.0.0", () => {
    console.log(`LLM Adapter Service listening on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
