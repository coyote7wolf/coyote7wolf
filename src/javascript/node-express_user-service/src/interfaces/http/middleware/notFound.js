'use strict';
module.exports = function notFound() {
  return (req, res) => {
    res
      .status(404)
      .json({ error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` } });
  };
};
