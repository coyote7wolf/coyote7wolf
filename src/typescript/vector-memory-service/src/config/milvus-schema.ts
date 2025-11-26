/**
 * Milvus collection definitions
 *
 * Define schemas for vector and document storage collections
 */

export const MILVUS_VECTOR_COLLECTION = "vectors";
export const MILVUS_DOCUMENT_COLLECTION = "documents";

/**
 * vector collection Schema
 * store 768-dimensional vectors and related metadata
 */
export const VECTOR_COLLECTION_SCHEMA = {
  collectionName: MILVUS_VECTOR_COLLECTION,
  fields: [
    {
      name: "id",
      description: "primary key",
      dataType: "Int64",
      isPrimary: true,
      autoID: true,
    },
    {
      name: "documentId",
      description: "document identifier",
      dataType: "VarChar",
      params: { max_length: 256 },
    },
    {
      name: "userId",
      description: "user identifier",
      dataType: "VarChar",
      params: { max_length: 256 },
    },
    {
      name: "title",
      description: "document title",
      dataType: "VarChar",
      params: { max_length: 512 },
    },
    {
      name: "content",
      description: "document content",
      dataType: "VarChar",
      params: { max_length: 65535 },
    },
    {
      name: "vector",
      description: "768-dimensional dense vector",
      dataType: "FloatVector",
      params: {
        dim: 768,
      },
    },
    {
      name: "tags",
      description: "document tags",
      dataType: "VarChar",
      params: { max_length: 1024 },
    },
    {
      name: "metadata",
      description: "document metadata as JSON string",
      dataType: "VarChar",
      params: { max_length: 4096 },
    },
    {
      name: "createdAt",
      description: "creation timestamp",
      dataType: "Int64",
    },
    {
      name: "updatedAt",
      description: "last update timestamp",
      dataType: "Int64",
    },
  ],
};

/**
 * 文檔集合 Schema
 * 存儲文檔全文搜尋相關信息
 */
export const DOCUMENT_COLLECTION_SCHEMA = {
  collectionName: MILVUS_DOCUMENT_COLLECTION,
  fields: [
    {
      name: "id",
      description: "primary key",
      dataType: "Int64",
      isPrimary: true,
      autoID: true,
    },
    {
      name: "documentId",
      description: "document identifier",
      dataType: "VarChar",
      params: { max_length: 256 },
    },
    {
      name: "userId",
      description: "user identifier",
      dataType: "VarChar",
      params: { max_length: 256 },
    },
    {
      name: "title",
      description: "document title",
      dataType: "VarChar",
      params: { max_length: 512 },
    },
    {
      name: "content",
      description: "document content",
      dataType: "VarChar",
      params: { max_length: 65535 },
    },
    {
      name: "tags",
      description: "document tags as comma-separated string",
      dataType: "VarChar",
      params: { max_length: 1024 },
    },
    {
      name: "metadata",
      description: "document metadata as JSON string",
      dataType: "VarChar",
      params: { max_length: 4096 },
    },
    {
      name: "createdAt",
      description: "creation timestamp",
      dataType: "Int64",
    },
    {
      name: "updatedAt",
      description: "last update timestamp",
      dataType: "Int64",
    },
  ],
};

/**
 * Milvus 索引配置
 */
export const VECTOR_INDEX_CONFIG = {
  indexName: "vector_index",
  metricType: "COSINE", // 支持: L2, IP (inner product), COSINE
  indexType: "HNSW", // Hierarchical Navigable Small World
  params: {
    M: 16, // 連接數
    efConstruction: 200, // 構建參數
    ef: 200, // 搜尋參數
  },
};

/**
 * Milvus 索引參數
 * 支持多種索引類型: FLAT, IVF_FLAT, IVF_SQ8, IVF_PQ, HNSW
 */
export const INDEX_TYPES = {
  FLAT: {
    indexType: "FLAT",
    metricType: "COSINE",
  },
  IVF_FLAT: {
    indexType: "IVF_FLAT",
    metricType: "COSINE",
    params: {
      nlist: 128, // clustering centroids
    },
  },
  IVF_SQ8: {
    indexType: "IVF_SQ8",
    metricType: "COSINE",
    params: {
      nlist: 128,
    },
  },
  HNSW: {
    indexType: "HNSW",
    metricType: "COSINE",
    params: {
      M: 16,
      efConstruction: 200,
    },
  },
  ANNOY: {
    indexType: "ANNOY",
    metricType: "COSINE",
    params: {
      n_trees: 256,
    },
  },
};

/**
 * Default index type for vector collection
 * HNSW provides the best speed/accuracy trade-off
 */
export const DEFAULT_INDEX_TYPE = INDEX_TYPES.HNSW;
