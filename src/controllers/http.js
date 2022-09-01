const APIError = require('../utils/error');
const { dataInMemory: frozenData, isNumber } = require('../utils/util');

const controller = {};

// mock http code response
controller.getHttpStatus = ({ httpCode, message }) => {
  if (!isNumber(httpCode)) {
    throw new APIError(`Status code "${httpCode}" is invalid`, 500);
  }

  if (!frozenData.httpCodes.codes.includes(httpCode)) {
    throw new APIError(`Status code "${httpCode}" is not supported`, 500);
  }

  const responseMessage = message || frozenData.httpCodes.messages[httpCode];

  return { status: httpCode, message: responseMessage };
};

module.exports = controller;
