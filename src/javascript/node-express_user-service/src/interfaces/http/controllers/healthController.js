'use strict';
exports.liveness = async (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
