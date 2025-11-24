'use strict';
const { errorCodes } = require('../../../constants');

module.exports = function errorHandler() {
  // eslint-disable-next-line no-unused-vars
  return (err, _req, res, _next) => {
    const status = err.status || 500;
    const code = err.code || errorCodes.INTERNAL_ERROR;
    if (status >= 500) {
      // Basic logging (in a real app we would inject logger)
      // eslint-disable-next-line no-console
      console.error(err);
    }
    res.status(status).json({ error: { code, message: err.message } });
  };
};
