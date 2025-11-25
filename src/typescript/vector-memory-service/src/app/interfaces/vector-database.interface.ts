/**
 * Vector Database Strategy Interface
 *
 * 定義向量數據庫的通用介面，支持多種實現 (Elasticsearch, Milvus, FAISS, pgvector)
 * 通過策略模式實現數據庫切換
 */

export interface VectorSearchParams {
  vector: number[];
  k: number;
  filters?: Record<string, any>;
  minScore?: number;
}

export interface FullTextSearchParams {
  query: string;
  fields?: string[];
  limit?: number;
  offset?: number;
  highlight?: boolean;
}

export interface PhraseSearchParams {
  phrase: string;
  fields?: string[];
  limit?: number;
  slop?: number;
}

export interface PrefixSearchParams {
  prefix: string;
  fields?: string[];
  limit?: number;
}

export interface HybridSearchParams {
  vector?: number[];
  query?: string;
  filters?: Record<string, any>;
  weights?: {
    vector?: number;
    text?: number;
    recency?: number;
  };
  k?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  score: number;
  source: Record<string, any>;
  highlight?: Record<string, string[]>;
}

export interface SearchResponse {
  type:
    | "vector_search"
    | "fulltext_search"
    | "phrase_search"
    | "prefix_search"
    | "hybrid_search";
  total: number;
  results: SearchResult[];
  took?: number;
}

export interface DocumentOperationResult {
  success: boolean;
  message?: string;
  id?: string;
}

export interface IndexStats {
  docs_count: number;
  store_size_bytes: number;
  indexed_vectors?: number;
}

export interface ClusterStats {
  status?: string;
  active_primary_shards?: number;
  active_shards?: number;
  version?: string;
}

/**
 * 核心 Vector Database 介面
 */
export interface IVectorDatabase {
  // 連接管理
  ping(): Promise<boolean>;
  getInfo(): Promise<Record<string, any>>;
  health(): Promise<Record<string, any>>;

  // 索引管理
  createVectorIndex(): Promise<void>;
  createDocumentIndex(): Promise<void>;
  deleteIndex(indexName: string): Promise<void>;
  indexExists(indexName: string): Promise<boolean>;
  clearIndex(indexName: string): Promise<void>;

  // 文檔操作
  indexDocument(params: {
    documentId: string;
    userId: string;
    title: string;
    content: string;
    vector: number[];
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<DocumentOperationResult>;

  updateDocument(
    documentId: string,
    updates: Partial<{
      title: string;
      content: string;
      tags: string[];
      metadata: Record<string, any>;
    }>
  ): Promise<DocumentOperationResult>;

  deleteDocument(documentId: string): Promise<DocumentOperationResult>;

  bulkIndex(
    documents: Array<{
      documentId: string;
      userId: string;
      title: string;
      content: string;
      vector: number[];
      tags?: string[];
      metadata?: Record<string, any>;
    }>
  ): Promise<DocumentOperationResult>;

  // 搜尋功能
  vectorSearch(params: VectorSearchParams): Promise<SearchResponse>;
  fullTextSearch(params: FullTextSearchParams): Promise<SearchResponse>;
  phraseSearch(params: PhraseSearchParams): Promise<SearchResponse>;
  prefixSearch(params: PrefixSearchParams): Promise<SearchResponse>;
  hybridSearch(params: HybridSearchParams): Promise<SearchResponse>;

  // 統計信息
  getIndexStats(indexName: string): Promise<IndexStats>;
  getClusterStats(): Promise<ClusterStats>;
}

/**
 * Vector Database 工廠
 * 根據環境變量選擇具體實現
 */
export interface IVectorDatabaseFactory {
  create(): Promise<IVectorDatabase>;
}
