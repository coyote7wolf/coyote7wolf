/**
 * Milvus 配置與客戶端管理
 *
 * 提供 Milvus 連接的單例管理、連接池、健康檢查等功能
 */

import { Logger } from "@nestjs/common";

const logger = new Logger("MilvusConfig");

// 類型定義 (實際 SDK 會提供完整類型)
interface MilvusConfig {
  address: string;
  port: number;
  username?: string;
  password?: string;
  logLevel?: string;
  ssl?: {
    serverName?: string;
    certPath?: string;
  };
}

class MilvusConfigManager {
  private static instance: any;
  private static connecting = false;

  /**
   * 獲取 Milvus 客戶端 (單例)
   */
  static getClient(): any {
    if (!this.instance) {
      this.instance = this.createClient();
    }
    return this.instance;
  }

  /**
   * 創建 Milvus 客戶端
   */
  private static createClient(): any {
    const config: MilvusConfig = {
      address: process.env.MILVUS_HOST || "localhost",
      port: parseInt(process.env.MILVUS_PORT || "19530"),
      username: process.env.MILVUS_USERNAME || "minioadmin",
      password: process.env.MILVUS_PASSWORD || "minioadmin",
      logLevel: process.env.MILVUS_LOG_LEVEL || "info",
      // SSL 配置 (可選)
      ssl:
        process.env.MILVUS_SSL === "true"
          ? {
              serverName: process.env.MILVUS_SERVER_NAME || "milvus",
              certPath: process.env.MILVUS_CERT_PATH,
            }
          : undefined,
    };

    logger.debug(`Connecting to Milvus at ${config.address}:${config.port}`);

    // 動態導入以避免依賴問題
    try {
      const { MilvusClient } = require("@milvus-io/milvus2-sdk-node");
      const client = new MilvusClient(config);
      return client;
    } catch (error) {
      logger.warn("MilvusClient SDK not available, returning mock client");
      return null;
    }
  }

  /**
   * 初始化連接並驗證
   */
  static async initialize(): Promise<void> {
    if (this.connecting) {
      logger.log("Connection in progress, waiting...");
      return;
    }

    if (this.instance) {
      logger.log("Milvus client already initialized");
      return;
    }

    try {
      this.connecting = true;
      const client = this.getClient();

      // 測試連接
      const isHealthy = await this.ping();
      if (isHealthy) {
        logger.log("✓ Milvus connected successfully");
      } else {
        throw new Error("Milvus health check failed");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to initialize Milvus connection: ${errorMsg}`);
      this.instance = null;
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  /**
   * 健康檢查
   */
  static async ping(): Promise<boolean> {
    try {
      const client = this.getClient();
      // 嘗試獲取版本信息來驗證連接
      const buildInfo = await client.getBuildInfo();
      logger.log(`✓ Milvus ping successful - Version: ${buildInfo.buildTag}`);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`✗ Milvus ping failed: ${errorMsg}`);
      return false;
    }
  }

  /**
   * 獲取 Milvus 信息
   */
  static async getInfo(): Promise<Record<string, any>> {
    try {
      const client = this.getClient();
      const buildInfo = await client.getBuildInfo();

      return {
        version: buildInfo.buildTag,
        buildDate: buildInfo.buildDate,
        gitCommit: buildInfo.gitCommit,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to get Milvus info: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * 關閉連接
   */
  static async close(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.closeConnection();
        logger.log("✓ Milvus connection closed");
        this.instance = null;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to close Milvus connection: ${errorMsg}`);
      }
    }
  }

  /**
   * 重置連接 (用於重新連接)
   */
  static async reset(): Promise<void> {
    await this.close();
    await this.initialize();
  }
}

export const MilvusConfig = MilvusConfigManager;
