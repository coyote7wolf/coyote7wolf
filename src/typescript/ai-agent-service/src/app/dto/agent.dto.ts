import {
  IsString,
  IsOptional,
  IsObject,
  IsIn,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class AgentActDto {
  @IsString()
  @IsIn([
    "summarize",
    "analyze",
    "recommend",
    "correct",
    "generate",
    "extract",
    "classify",
  ])
  task!:
    | "summarize"
    | "analyze"
    | "recommend"
    | "correct"
    | "generate"
    | "extract"
    | "classify";

  @IsString()
  input!: string;

  @IsOptional()
  @IsObject()
  context?: any;

  @IsOptional()
  @IsObject()
  parameters?: {
    temperature?: number;
    max_length?: number;
    style?: string;
    format?: string;
  };

  @IsOptional()
  @IsString()
  session_id?: string;
}

export class TaskContextDto {
  @IsString()
  user_id!: string;

  @IsString()
  session_id!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previous_tasks?: string[];

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class TaskResultDto {
  @IsString()
  task_id!: string;

  @IsString()
  task!: string;

  @IsString()
  status!: "pending" | "processing" | "completed" | "failed";

  @IsOptional()
  result?: any;

  @IsOptional()
  reasoning?: string;

  @IsOptional()
  confidence?: number;

  @IsOptional()
  metadata?: any;
}
