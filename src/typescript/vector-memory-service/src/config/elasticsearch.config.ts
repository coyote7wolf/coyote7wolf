import { Client } from "@elastic/elasticsearch";
import { Logger } from "@nestjs/common";

const logger = new Logger("ElasticsearchConfig");

/**
 * Elasticsearch configuration and client management
 */
export class ElasticsearchConfig {
  private static instance: Client;

  /**
   * create or get existing Elasticsearch client
   */
  static getClient(): Client {
    if (!ElasticsearchConfig.instance) {
      const host = process.env.ELASTICSEARCH_HOST || "http://localhost:9200";
      const logLevel = (process.env.ELASTICSEARCH_LOG_LEVEL || "info") as any;

      logger.log(`Initializing Elasticsearch client at ${host}`);

      ElasticsearchConfig.instance = new Client({
        node: host,
        requestTimeout: 30000,
        maxRetries: 3,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME || "elastic",
          password: process.env.ELASTICSEARCH_PASSWORD || "",
        },
        tls: {
          rejectUnauthorized: false,
        },
      } as any);
    }

    return ElasticsearchConfig.instance;
  }

  /**
   * ping Elasticsearch to check connection
   */
  static async ping(): Promise<boolean> {
    try {
      const client = ElasticsearchConfig.getClient();
      await client.ping();
      logger.log("✓ Elasticsearch connection successful");
      return true;
    } catch (error) {
      logger.error("✗ Elasticsearch connection failed:", error);
      return false;
    }
  }

  /**
   * close Elasticsearch client connection
   */
  static async close(): Promise<void> {
    if (ElasticsearchConfig.instance) {
      await ElasticsearchConfig.instance.close();
      logger.log("Elasticsearch connection closed");
    }
  }

  /**
   * fetch Elasticsearch server info
   */
  static async getInfo() {
    try {
      const client = ElasticsearchConfig.getClient();
      const info = await client.info();
      return info.version.number;
    } catch (error) {
      logger.error("Failed to get Elasticsearch info:", error);
      return null;
    }
  }
}
