class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP Status Code
   * @param {string} message - Error Message
   * @param {Array} errors - Optional array of specific errors (e.g., validation errors)
   * @param {string} stack - Error stack trace
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "",
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
