import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { UserModule } from "./modules/user/user.module";

async function bootstrap() {
  const env = process.env.NODE_ENV || "mock";

  // Always kill any process using port 3101 before starting
  const { execSync } = require("child_process");
  try {
    const pids = execSync("lsof -i :3101 | awk 'NR>1 {print $2}'", {
      encoding: "utf8",
    });
    if (pids.trim()) {
      pids.split(/\s+/).forEach((pid: string) => {
        if (pid) execSync(`kill ${pid}`);
      });
      console.log("Killed process(es) on port 3101 before starting app.");
    }
  } catch (e) {
    // Ignore if no process found
  }

  // Compose a root module that includes AppModule and UserModule (with env)
  const RootDynamicModule = {
    module: AppModule,
    imports: [UserModule.forRoot(env)],
  };
  const app = await NestFactory.create(RootDynamicModule as any);

  // Log relevant environment variables for quick visibility of mock/real providers
  const keysToShow = [
    "NODE_ENV",
    "DB",
    "DATABASE_URL",
    "DB_CONNECT",
    "REDIS",
    "REDIS_URL",
    "AUTH_SERVICE_URL",
    "DOCUMENT_SERVICE_URL",
    "NOTIFICATION_SERVICE_URL",
    "AUDIT_SERVICE_URL",
    "DASHBOARD_SERVICE_URL",
    "CMS_SERVICE_URL",
    "REALTIME_SERVICE_URL",
    "AI_ORCHESTRATOR_SERVICE_URL",
    "LLM_ADAPTER_SERVICE_URL",
    "AI_AGENT_SERVICE_URL",
    "SYNCCOREAI_AI_MEMORY_SERVICE_CONNECT",
    "AI_MEMORY_SERVICE_URL",
    "PORT",
  ];

  const hideInReal = env === "real";
  const nestLogPrefix = `[Nest] ${
    process.pid
  }  - ${new Date().toLocaleString()}     LOG [EnvLoader]`;
  for (const k of keysToShow) {
    const v = process.env[k];
    if (hideInReal) {
      console.log(
        `${nestLogPrefix} ${k} = ${v === undefined ? "<unset>" : "<set>"}`
      );
    } else {
      console.log(`${nestLogPrefix} ${k} = ${v === undefined ? "<unset>" : v}`);
    }
  }
  await app.listen(3101);
  console.log(
    `[Nest] ${
      process.pid
    }  - ${new Date().toLocaleString()}     LOG [NestApplication] User Service running on http://localhost:3101 [${env}]`
  );
}
bootstrap();
