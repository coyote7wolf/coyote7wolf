/**
 * Document index mapping configuration for Elasticsearch
 * Used for full-text search and content indexing
 */
export const DOCUMENT_INDEX_MAPPING = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    index: {
      max_result_window: 50000,
    },
    analysis: {
      analyzer: {
        /**
         * Standard analyzer (English + Chinese)
         * Uses simple tokenization to support local development
         */
        default: {
          type: "standard",
          stopwords: "_english_",
        },
        /**
         * Simplified Chinese analyzer
         */
        chinese: {
          type: "standard",
        },
      },
      filter: {
        /**
         * stop word filter for English
         */
        english_stop: {
          type: "stop",
          stopwords: "_english_",
        },
        /**
         * Synonym filter
         */
        synonym_filter: {
          type: "synonym",
          synonyms: [
            // AI related
            "AI => artificial intelligence,人工智能",
            "NLP => natural language processing,自然語言處理",
            "ML => machine learning,機器學習",
            "DL => deep learning,深度學習",
            "embedding => vector embedding,向量嵌入,向量化",
            "vector => vector,矢量",
            // Action related
            "search => search,搜尋,搜索,查詢",
            "find => find,尋找,搜尋",
            "retrieve => retrieve,檢索,擷取",
            "query => query,查詢,詢問",
            "delete => delete,刪除,移除,刪掉",
            "remove => remove,移除,刪除",
            "create => create,建立,新增,創建",
            "add => add,新增,添加,加入",
            "update => update,更新,修改",
            "modify => modify,修改,編輯",
            // Model related
            "model => model,預訓練",
            "BERT => BERT",
            "GPT => GPT",
            "transformer => transformer",
            // Evaluation related
            "metric => metric,指標,度量",
            "accuracy => accuracy,準確度,正確率",
            "precision => precision,精確度,準確率",
            "recall => recall,召回率,回召",
          ],
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
      title: {
        type: "text",
        analyzer: "default",
        fields: {
          keyword: {
            type: "keyword",
            ignore_above: 256,
          },
          english: {
            type: "text",
            analyzer: "default",
          },
        },
      },
      content: {
        type: "text",
        analyzer: "default",
        fields: {
          keyword: {
            type: "keyword",
            ignore_above: 256,
          },
          english: {
            type: "text",
            analyzer: "default",
          },
        },
      },
      userId: {
        type: "keyword",
        ignore_above: 256,
      },
      documentType: {
        type: "keyword",
        ignore_above: 256,
      },
      tags: {
        type: "keyword",
        ignore_above: 256,
      },
      status: {
        type: "keyword",
        ignore_above: 256,
      },
      source: {
        type: "keyword",
        ignore_above: 256,
      },
      language: {
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
      viewCount: {
        type: "integer",
      },
    },
  },
};

/**
 * Full-text search index name constant
 */
export const DOCUMENT_INDEX_NAME = "documents";
