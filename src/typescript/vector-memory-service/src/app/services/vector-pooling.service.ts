import { Injectable } from "@nestjs/common";

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata?: {
    source?: string;
    timestamp?: string;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: any;
}

export type PoolingStrategy =
  | "mean"
  | "first"
  | "sum"
  | "max"
  | "weighted_mean";
export type SimilarityMetric = "cosine" | "euclidean" | "dot_product";

@Injectable()
export class VectorPoolingService {
  /**
   * Apply pooling strategy to multiple embeddings
   */
  applyPooling(
    embeddings: number[][],
    strategy: PoolingStrategy = "mean",
    weights?: number[]
  ): number[] {
    if (embeddings.length === 0) {
      throw new Error("No embeddings provided");
    }

    if (embeddings.length === 1) {
      return embeddings[0];
    }

    const dimension = embeddings[0].length;

    // Validate all embeddings have the same dimension
    if (!embeddings.every((emb) => emb.length === dimension)) {
      throw new Error("All embeddings must have the same dimension");
    }

    switch (strategy) {
      case "mean":
        return this.meanPooling(embeddings);

      case "first":
        return embeddings[0];

      case "sum":
        return this.sumPooling(embeddings);

      case "max":
        return this.maxPooling(embeddings);

      case "weighted_mean":
        if (!weights || weights.length !== embeddings.length) {
          throw new Error(
            "Weights must be provided and match the number of embeddings for weighted_mean pooling"
          );
        }
        return this.weightedMeanPooling(embeddings, weights);

      default:
        throw new Error(`Unsupported pooling strategy: ${strategy}`);
    }
  }

  private meanPooling(embeddings: number[][]): number[] {
    const dimension = embeddings[0].length;
    const result = new Array(dimension).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dimension; i++) {
        result[i] += embedding[i];
      }
    }

    return result.map((val) => val / embeddings.length);
  }

  private sumPooling(embeddings: number[][]): number[] {
    const dimension = embeddings[0].length;
    const result = new Array(dimension).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dimension; i++) {
        result[i] += embedding[i];
      }
    }

    return result;
  }

  private maxPooling(embeddings: number[][]): number[] {
    const dimension = embeddings[0].length;
    const result = new Array(dimension).fill(-Infinity);

    for (const embedding of embeddings) {
      for (let i = 0; i < dimension; i++) {
        result[i] = Math.max(result[i], embedding[i]);
      }
    }

    return result;
  }

  private weightedMeanPooling(
    embeddings: number[][],
    weights: number[]
  ): number[] {
    const dimension = embeddings[0].length;
    const result = new Array(dimension).fill(0);
    const weightSum = weights.reduce((sum, w) => sum + w, 0);

    for (let embIdx = 0; embIdx < embeddings.length; embIdx++) {
      const weight = weights[embIdx];
      const embedding = embeddings[embIdx];

      for (let i = 0; i < dimension; i++) {
        result[i] += embedding[i] * weight;
      }
    }

    return result.map((val) => val / weightSum);
  }

  /**
   * Calculate similarity between two vectors
   */
  calculateSimilarity(
    vec1: number[],
    vec2: number[],
    metric: SimilarityMetric = "cosine"
  ): number {
    if (vec1.length !== vec2.length) {
      throw new Error("Vectors must have the same dimension");
    }

    switch (metric) {
      case "cosine":
        return this.cosineSimilarity(vec1, vec2);

      case "euclidean":
        return this.euclideanDistance(vec1, vec2);

      case "dot_product":
        return this.dotProduct(vec1, vec2);

      default:
        throw new Error(`Unsupported similarity metric: ${metric}`);
    }
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = this.dotProduct(vec1, vec2);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  private euclideanDistance(vec1: number[], vec2: number[]): number {
    const squaredDiffs = vec1.map((val, i) => Math.pow(val - vec2[i], 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0));
  }

  private dotProduct(vec1: number[], vec2: number[]): number {
    return vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  }

  /**
   * Normalize vector to unit length
   */
  normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude === 0) {
      return vector;
    }

    return vector.map((val) => val / magnitude);
  }

  /**
   * Generate mock embedding for testing
   */
  generateMockEmbedding(dimension: number = 768, seed?: string): number[] {
    const embedding = new Array(dimension);

    // Use seed for deterministic results in testing
    let hash = 0;
    if (seed) {
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff;
      }
    }

    for (let i = 0; i < dimension; i++) {
      const random = seed
        ? Math.sin(hash + i) * 0.5 + 0.5 // Deterministic based on seed
        : Math.random(); // Random

      embedding[i] = (random - 0.5) * 2; // Range: -1 to 1
    }

    return this.normalizeVector(embedding);
  }
}
