import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
  Max,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";

export class ChatMessageDto {
  @IsString()
  @IsIn(["system", "user", "assistant"])
  role!: "system" | "user" | "assistant";

  @IsString()
  content!: string;
}

export class ChatCompletionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4096)
  max_tokens?: number;

  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(["openai", "claude", "local"])
  provider?: string;
}

export class CompletionDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4096)
  max_tokens?: number;

  @IsOptional()
  @IsString()
  @IsIn(["openai", "claude", "local"])
  provider?: string;
}

export class EmbeddingDto {
  @IsNotEmpty()
  input!: string | string[];

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  @IsIn(["mean", "first", "sum"])
  pooling?: "mean" | "first" | "sum";

  @IsOptional()
  @IsString()
  @IsIn(["openai", "claude", "local"])
  provider?: string;
}

export class LoRATrainDto {
  @IsString()
  model!: string;

  @IsOptional()
  params?: any;

  @IsOptional()
  @IsString()
  dataset_path?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  epochs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  @Max(0.1)
  learning_rate?: number;
}

export class FineTuneDto {
  @IsString()
  model!: string;

  @IsOptional()
  params?: any;

  @IsOptional()
  @IsString()
  dataset_path?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  epochs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  @Max(0.1)
  learning_rate?: number;
}
