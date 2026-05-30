/**
 * Uniform structure for all successful API responses.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP Status Code
   * @param {any} data - The response payload
   * @param {string} message - Success message
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
