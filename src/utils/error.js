class APIError extends Error {
  constructor(message, code = 500, errors = null) {
    super(message);

    this.message = message;
    this.status = code;
    this.errors = errors;
  }
}

export default APIError;
