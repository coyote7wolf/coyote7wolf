'use strict';
const { errorCodes } = require('../../../constants');

module.exports = function validate(schema, location = 'body') {
  return (req, _res, next) => {
    if (!schema) return next();
    const data = req[location];
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      const errObj = new Error(message);
      errObj.code = errorCodes.VALIDATION_ERROR;
      errObj.status = 422;
      return next(errObj);
    }
    req[location] = value;
    return next();
  };
};
