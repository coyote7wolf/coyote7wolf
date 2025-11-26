import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsIn,
  Min,
  Max,
} from "class-validator";

export class EmbeddingDto {
  @IsArray()
  @IsString({ each: true })
  input!: string[];

  @IsOptional()
  @IsString()
  @IsIn(["mean", "first", "sum", "max", "weighted_mean"])
  pooling?: "mean" | "first" | "sum" | "max" | "weighted_mean";

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(128)
  @Max(4096)
  dimension?: number;
}

export class SearchDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number;

  @IsOptional()
  @IsString()
  @IsIn(["cosine", "euclidean", "dot_product"])
  similarity_metric?: "cosine" | "euclidean" | "dot_product";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filters?: string[];
}

export class StoreDocumentDto {
  @IsString()
  id!: string;

  @IsString()
  content!: string;

  @IsArray()
  @IsNumber({}, { each: true })
  embedding!: number[];

  @IsOptional()
  metadata?: {
    source?: string;
    timestamp?: string;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export class DeleteDocumentDto {
  @IsString()
  id!: string;
}

export class BulkOperationDto {
  @IsArray()
  documents!: StoreDocumentDto[];

  @IsOptional()
  @IsString()
  @IsIn(["upsert", "insert", "update"])
  operation?: "upsert" | "insert" | "update";
}
