/**
 * vector index mapping configuration for Elasticsearch
 */
export const VECTOR_INDEX_MAPPING = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    index: {
      max_result_window: 50000,
    },
    analysis: {
      analyzer: {
        ik_max_word: {
          type: "standard",
        },
      },
    },
  },
  mappings: {
    properties: {
      id: {
        type: "keyword",
        ignore_above: 256,
      },
      documentId: {
        type: "keyword",
        ignore_above: 256,
      },
      userId: {
        type: "keyword",
        ignore_above: 256,
      },
      content: {
        type: "text",
        analyzer: "standard",
        fields: {
          keyword: {
            type: "keyword",
            ignore_above: 256,
          },
        },
      },
      title: {
        type: "text",
        analyzer: "standard",
        fields: {
          keyword: {
            type: "keyword",
            ignore_above: 256,
          },
        },
      },
      vector: {
        type: "dense_vector",
        dims: 768,
        index: true,
        similarity: "cosine",
      },
      pooling_type: {
        type: "keyword",
        ignore_above: 256,
      },
      similarity_metric: {
        type: "keyword",
        ignore_above: 256,
      },
      source: {
        type: "keyword",
        ignore_above: 256,
      },
      tags: {
        type: "keyword",
        ignore_above: 256,
      },
      metadata: {
        type: "object",
        enabled: true,
      },
      createdAt: {
        type: "date",
      },
      updatedAt: {
        type: "date",
      },
    },
  },
};

/**
 * vector index name constant
 */
export const VECTOR_INDEX_NAME = "embeddings";

/**
 * document index name constant
 */
export const DOCUMENT_INDEX_NAME = "documents";
