class APIError extends Error {
  constructor(message, code, errors) {
    super(message);

    this.message = message;
    this.status = code;
    this.errors = errors;
  }
}

module.exports = APIError;
