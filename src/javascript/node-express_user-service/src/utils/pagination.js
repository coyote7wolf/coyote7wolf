'use strict';
function parsePagination(query, { defaultLimit, maxLimit }) {
  let { offset = 0, limit = defaultLimit } = query;
  offset = parseInt(offset, 10) || 0;
  limit = Math.min(parseInt(limit, 10) || defaultLimit, maxLimit);
  return { offset, limit };
}

module.exports = { parsePagination };
