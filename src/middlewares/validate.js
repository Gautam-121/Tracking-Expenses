import ApiError from '../utils/ApiError.js';
import HttpStatusCode from '../utils/HttpStatusCode.js';

// Fields that should never be mutated by the global sanitizer
const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'key'];

/**
 * Cleans text for messaging apps safely (encodes HTML instead of destroying it, normalizes emojis).
 * @param {any} value - The value to sanitize
 * @returns {any} Sanitized value
 */
const sanitizeValue = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    // Encode < and > to prevent basic XSS while preserving message intent (e.g. math formulas)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Normalize Unicode (essential for complex emojis/combined characters)
    .normalize('NFKC')
    // Remove dangerous control characters
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
};

/**
 * Recursively sanitizes an object or array, protecting against circular references and buffers.
 */
const deepSanitize = (data, seen = new WeakSet()) => {
  // Primitives, null, undefined
  if (!data || typeof data !== 'object') return sanitizeValue(data);
  // Prevent circular reference crashes
  if (seen.has(data)) return '[Circular]';
  seen.add(data);
  // Preserve native instances that should not be iterated (prevents Buffer destruction)
  if (Buffer.isBuffer(data) || data instanceof Date || data instanceof RegExp) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => deepSanitize(item, seen));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    // Never blindly sanitize sensitive fields like passwords
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = value;
    } else {
      sanitized[key] = deepSanitize(value, seen);
    }
  }
  return sanitized;
};

/**
 * Internal validation logic with enhanced error mapping.
 */
const validateInternal = async (schema, data, options = { sanitize: false }) => {
  // 1. Optional Pre-sanitize data (rarely used now as Zod transforms are better)
  let input = options.sanitize ? deepSanitize(data) : data;
  // 2. Validate using Zod (Zod automatically strips unknown keys by default)
  const result = await schema.safeParseAsync(input);
  if (!result.success) {
    const errorDetails = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    throw new ApiError(
      HttpStatusCode.BAD_REQUEST,
      'Data validation failed. Please check your inputs.',
      errorDetails
    );
  }

  return result.data;
};

/**
 * Antigravity Skill: Express Middleware Factory
 * Validates body, query, and params.
 */
export const validateRequest = (schemas, options = { sanitize: false }) => async (req, res, next) => {
  try {
    if (schemas.params) {
      req.params = await validateInternal(schemas.params, req.params, options);
    }
    if (schemas.query) {
      req.query = await validateInternal(schemas.query, req.query, options);
    }
    if (schemas.body) {
      // CRITICAL: Overwrite req.body with the sanitized/filtered data from Zod
      req.body = await validateInternal(schemas.body, req.body, options);
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates an array of items and returns a map of errors per index.
*/
export const validateMany = (schema, options = { sanitize: false }) => async (items) => {
  if (!Array.isArray(items)) throw new Error('Input must be an array');

  const results = await Promise.all(
    items.map(async (item, index) => {
      try {
        const data = await validateInternal(schema, item, options);
        return { index, success: true, data };
      } catch (error) {
        return { index, success: false, errors: error.errors };
      }
    })
  );

  const errors = results.filter(r => !r.success);
  if (errors.length > 0) {
    throw new ApiError(
      HttpStatusCode.BAD_REQUEST,
      `Validation failed for ${errors.length} items.`,
      errors
    );
  }

  return results.map(r => r.data);
};

/**
 * Simple validation wrapper for single objects.
 */
export const validate = (schema, options = { sanitize: false }) => (data) => validateInternal(schema, data, options);

export default {
  validateRequest,
  validateMany,
  validate
};
