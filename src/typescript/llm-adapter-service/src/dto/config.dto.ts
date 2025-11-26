import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from "class-validator";

export class LocalModelConfig {
  @IsString()
  modelPath!: string;

  @IsString()
  modelType!: string;

  @IsNumber()
  embeddingDimension!: number;

  @IsNumber()
  @IsOptional()
  contextLength?: number = 2048;

  @IsNumber()
  @IsOptional()
  gpuLayers?: number = 0;
}

export class ServiceConfig {
  @IsNumber()
  port!: number;

  @IsString()
  @IsOptional()
  nodeEnv?: string = "development";

  @IsString()
  @IsOptional()
  logLevel?: string = "info";

  @IsBoolean()
  @IsOptional()
  enableRequestLogging?: boolean = true;
}
