const APIError = require('../utils/error');
const { dataInMemory: frozenData, isNumber } = require('../utils/util');

const controller = {};

// mock http code response
controller.getHttpStatus = ({ httpCode: status, message }) => {
  if (!isNumber(status)) {
    throw new APIError(`Status code '${status}' is invalid`, 500);
  }

  if (!frozenData.httpCodes.codes.includes(status)) {
    throw new APIError(`Status code '${status}' is not supported`, 500);
  }

  const title = message || frozenData.httpCodes.messages[status];

  const response = { status: parseInt(status, 10) };

  if (status >= 400) {
    // For 4xx and 5xx errors
    response.title = title;
    response.type = 'about:blank';
    response.detail = title || '';
  }

  if (response.status !== 204) {
    // For 2xx and 3xx success
    response.message = title;
  }

  return response;
};

module.exports = controller;
