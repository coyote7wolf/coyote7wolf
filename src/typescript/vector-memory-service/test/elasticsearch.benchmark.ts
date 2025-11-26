import { ElasticsearchService } from "../src/app/services/elasticsearch.service";

/**
 * Performance Benchmark Tests for Elasticsearch
 *
 * Measures and validates performance of all search operations:
 * - Vector search: target < 50ms
 * - Full-text search: target < 100ms
 * - Hybrid search: target < 150ms
 * - Phrase search: target < 75ms
 * - Prefix search: target < 50ms
 * - Bulk indexing: target < 1s for 1000 docs
 *
 * Run: pnpm test -- elasticsearch.benchmark.ts
 */

interface BenchmarkResult {
  operation: string;
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
  target?: number;
  status: "PASS" | "WARN" | "FAIL";
}

class PerformanceBenchmark {
  private service: ElasticsearchService;
  private results: BenchmarkResult[] = [];
  private testVector = Array(768)
    .fill(0)
    .map((_, i) => Math.sin(i / 100));
  private testDocuments: any[] = [];

  constructor() {
    // Initialize service (would be injected in real scenario)
    this.service = new ElasticsearchService();
  }

  /**
   * Measure operation execution time
   */
  private async measureOperation<T>(
    operation: () => Promise<T>,
    iterations = 1
  ): Promise<number[]> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await operation();
      const end = process.hrtime.bigint();

      const duration = Number(end - start) / 1_000_000; // Convert to ms
      times.push(duration);
    }

    return times;
  }

  /**
   * Calculate statistics from measurements
   */
  private calculateStats(
    times: number[]
  ): Omit<BenchmarkResult, "operation" | "target" | "status"> {
    const sorted = times.sort((a, b) => a - b);

    return {
      count: times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  /**
   * Determine benchmark status based on target
   */
  private determineStatus(
    avg: number,
    target?: number
  ): "PASS" | "WARN" | "FAIL" {
    if (!target) return "PASS";
    if (avg <= target) return "PASS";
    if (avg <= target * 1.2) return "WARN"; // 20% over target
    return "FAIL";
  }

  /**
   * Benchmark: Vector Search Performance
   */
  async benchmarkVectorSearch(): Promise<BenchmarkResult> {
    console.log("\n📊 Benchmarking Vector Search...");

    const times = await this.measureOperation(
      async () => {
        await this.service.vectorSearch(this.testVector, 10);
      },
      30 // 30 iterations
    );

    const stats = this.calculateStats(times);
    const target = 50; // ms

    const result: BenchmarkResult = {
      operation: "Vector Search (k=10)",
      ...stats,
      target,
      status: this.determineStatus(stats.avg, target),
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Benchmark: Full-Text Search Performance
   */
  async benchmarkFullTextSearch(): Promise<BenchmarkResult> {
    console.log("\n📊 Benchmarking Full-Text Search...");

    const queries = [
      "artificial intelligence",
      "machine learning",
      "neural network",
      "deep learning",
      "nlp",
    ];
    const times: number[] = [];

    for (const query of queries) {
      const queryTimes = await this.measureOperation(
        async () => {
          await this.service.fullTextSearch(
            query,
            ["title", "content"],
            20,
            0,
            false
          );
        },
        6 // 6 iterations per query
      );
      times.push(...queryTimes);
    }

    const stats = this.calculateStats(times);
    const target = 100; // ms

    const result: BenchmarkResult = {
      operation: "Full-Text Search (avg)",
      ...stats,
      target,
      status: this.determineStatus(stats.avg, target),
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Benchmark: Phrase Search Performance
   */
  async benchmarkPhraseSearch(): Promise<BenchmarkResult> {
    console.log("\n📊 Benchmarking Phrase Search...");

    const phrases = [
      "machine learning model",
      "neural network training",
      "data processing pipeline",
    ];
    const times: number[] = [];

    for (const phrase of phrases) {
      const phraseTimes = await this.measureOperation(
        async () => {
          await this.service.phraseSearch(phrase, ["title", "content"], 10, 0);
        },
        10 // 10 iterations per phrase
      );
      times.push(...phraseTimes);
    }

    const stats = this.calculateStats(times);
    const target = 75; // ms

    const result: BenchmarkResult = {
      operation: "Phrase Search (avg)",
      ...stats,
      target,
      status: this.determineStatus(stats.avg, target),
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Benchmark: Prefix Search Performance
   */
  async benchmarkPrefixSearch(): Promise<BenchmarkResult> {
    console.log("\n📊 Benchmarking Prefix Search...");

    const prefixes = ["art", "mac", "neu", "dee", "tra"];
    const times: number[] = [];

    for (const prefix of prefixes) {
      const prefixTimes = await this.measureOperation(
        async () => {
          await this.service.prefixSearch("title", prefix, 20);
        },
        6 // 6 iterations per prefix
      );
      times.push(...prefixTimes);
    }

    const stats = this.calculateStats(times);
    const target = 50; // ms

    const result: BenchmarkResult = {
      operation: "Prefix Search (avg)",
      ...stats,
      target,
      status: this.determineStatus(stats.avg, target),
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Benchmark: Hybrid Search Performance
   */
  async benchmarkHybridSearch(): Promise<BenchmarkResult> {
    console.log("\n📊 Benchmarking Hybrid Search...");

    const times = await this.measureOperation(
      async () => {
        await this.service.hybridSearch(
          this.testVector,
          "machine learning",
          undefined,
          { vector: 0.6, text: 0.3, recency: 0.1 },
          10
        );
      },
      20 // 20 iterations
    );

    const stats = this.calculateStats(times);
    const target = 150; // ms

    const result: BenchmarkResult = {
      operation: "Hybrid Search (vector+text+filter)",
      ...stats,
      target,
      status: this.determineStatus(stats.avg, target),
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Benchmark: Bulk Indexing Performance
   */
  async benchmarkBulkIndexing(): Promise<BenchmarkResult> {
    console.log("\n📊 Benchmarking Bulk Indexing...");

    // Prepare bulk documents (different sizes)
    const sizes = [100, 500, 1000];
    const times: number[] = [];

    for (const size of sizes) {
      const docs = Array(size)
        .fill(0)
        .map((_, i) => ({
          id: `bulk-bench-${i}`,
          body: {
            userId: `user-${i % 10}`,
            title: `Document ${i}`,
            content: `Content for document ${i}...`,
            vector: this.testVector,
            tags: ["benchmark", "bulk"],
          },
        }));

      const bulkTimes = await this.measureOperation(
        async () => {
          await this.service.bulkIndex("vectors", docs);
        },
        3 // 3 iterations
      );

      times.push(...bulkTimes);
    }

    const stats = this.calculateStats(times);
    const target = 1000; // ms for 1000 docs

    const result: BenchmarkResult = {
      operation: "Bulk Indexing (100-1000 docs)",
      ...stats,
      target,
      status: this.determineStatus(stats.avg, target),
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Benchmark: Index Statistics Retrieval
   */
  async benchmarkIndexStats(): Promise<BenchmarkResult> {
    console.log("\n📊 Benchmarking Index Stats Retrieval...");

    const times = await this.measureOperation(
      async () => {
        await this.service.getIndexStats("vectors");
      },
      20 // 20 iterations
    );

    const stats = this.calculateStats(times);
    const target = 20; // ms

    const result: BenchmarkResult = {
      operation: "Index Stats Retrieval",
      ...stats,
      target,
      status: this.determineStatus(stats.avg, target),
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Print formatted result
   */
  private printResult(result: BenchmarkResult): void {
    const statusEmoji =
      result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : "❌";
    const targetStr = result.target ? ` (target: ${result.target}ms)` : "";

    console.log(`
${statusEmoji} ${result.operation}${targetStr}
   Min:  ${result.min.toFixed(2)}ms
   Avg:  ${result.avg.toFixed(2)}ms
   P50:  ${result.p50.toFixed(2)}ms
   P95:  ${result.p95.toFixed(2)}ms
   P99:  ${result.p99.toFixed(2)}ms
   Max:  ${result.max.toFixed(2)}ms
   Iterations: ${result.count}
    `);
  }

  /**
   * Run all benchmarks
   */
  async runAll(): Promise<void> {
    console.log("🚀 Starting Elasticsearch Performance Benchmarks");
    console.log("=".repeat(60));

    try {
      await this.benchmarkVectorSearch();
      await this.benchmarkFullTextSearch();
      await this.benchmarkPhraseSearch();
      await this.benchmarkPrefixSearch();
      await this.benchmarkHybridSearch();
      await this.benchmarkBulkIndexing();
      await this.benchmarkIndexStats();

      this.printSummary();
    } catch (error) {
      console.error("❌ Benchmark failed:", error);
    }
  }

  /**
   * Print summary report
   */
  private printSummary(): void {
    console.log("\n" + "=".repeat(60));
    console.log("📈 BENCHMARK SUMMARY");
    console.log("=".repeat(60));

    const passed = this.results.filter((r) => r.status === "PASS").length;
    const warned = this.results.filter((r) => r.status === "WARN").length;
    const failed = this.results.filter((r) => r.status === "FAIL").length;

    console.log(`
Total Tests: ${this.results.length}
✅ Passed:  ${passed}
⚠️  Warned:  ${warned}
❌ Failed:  ${failed}
    `);

    console.log("\n📊 Detailed Results:");
    console.log("-".repeat(60));

    for (const result of this.results) {
      const status =
        result.status === "PASS"
          ? "✅"
          : result.status === "WARN"
          ? "⚠️"
          : "❌";
      const target = result.target ? ` (${result.target}ms target)` : "";
      console.log(
        `${status} ${result.operation.padEnd(40)}${result.avg
          .toFixed(2)
          .padStart(8)}ms${target}`
      );
    }

    console.log("-".repeat(60));

    // Recommendations
    console.log("\n💡 Recommendations:");
    for (const result of this.results) {
      if (result.status !== "PASS" && result.target) {
        const overhead = (
          ((result.avg - result.target) / result.target) *
          100
        ).toFixed(1);
        console.log(
          `  - ${result.operation}: ${overhead}% over target - consider optimization`
        );
      }
    }

    console.log("\n✅ Benchmark Complete!");
  }
}

// Run benchmarks
async function main(): Promise<void> {
  const benchmark = new PerformanceBenchmark();
  await benchmark.runAll();
}

// Execute if this is the main module
if (require.main === module) {
  main().catch(console.error);
}

export { PerformanceBenchmark, BenchmarkResult };
