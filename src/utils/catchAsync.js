/**
 * A wrapper to catch errors in async routes and pass them to the global error handler.
 * This eliminates the need for try-catch blocks in every controller.
*/
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
