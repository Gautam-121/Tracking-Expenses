import HttpStatusCode from '../utils/HttpStatusCode.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

// --- Sequelize Error Handlers ---
const handleConnectionErrorDB = (err) => {
    console.error('Database connection error:', { error: err.message, stack: err.stack });
    return new ApiError(HttpStatusCode.SERVICE_UNAVAILABLE, "We're experiencing temporary system issues. Please try again in a few moments.");
};

const handleTimeoutErrorDB = (err) => {
    console.error('Database timeout error:', { error: err.message });
    return new ApiError(HttpStatusCode.REQUEST_TIMEOUT, "The request took too long to process. Please try again.");
};

const handleDatabaseErrorDB = (err) => {
    const sanitizedSql = err.sql ? err.sql.replace(/('.*?'|".*?")/g, "'***'") : undefined;
    console.error('Database error:', { error: err.message, sql: sanitizedSql });

    if (err.message.includes('syntax error')) {
        return new ApiError(HttpStatusCode.BAD_REQUEST, "There was a problem with the data provided.");
    }
    if (err.message.includes('permission denied')) {
        return new ApiError(HttpStatusCode.FORBIDDEN, "You don't have permission to perform this action.");
    }
    if (err.message.includes('relation') && err.message.includes('does not exist')) {
        return new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "We couldn't find the requested information.");
    }

    return new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "An unexpected error occurred. Our team has been notified.");
};

const handleOptimisticLockErrorDB = () => {
    return new ApiError(HttpStatusCode.CONFLICT, "Someone else just updated this information. Please refresh the page to see the latest changes.");
};

const handleExclusionConstraintErrorDB = () => {
    return new ApiError(HttpStatusCode.CONFLICT, "This change conflicts with existing data. Please review your input.");
};

const handleCheckConstraintErrorDB = () => {
    return new ApiError(HttpStatusCode.BAD_REQUEST, "Some of the provided information is invalid. Please double-check your entries.");
};

const handleConnectionRefusedErrorDB = (err) => {
    console.error('Database connection refused:', { error: err.message });
    return new ApiError(HttpStatusCode.SERVICE_UNAVAILABLE, "Our servers are currently unreachable. Please try again shortly.");
};

const handleConnectionTimedOutErrorDB = (err) => {
    console.error('Database connection timed out:', { error: err.message });
    // 504 Gateway Timeout mapping
    return new ApiError(504, "Server connection timed out. Please try again.");
};

const errorMiddleware = (err, req, res, next) => {
    let error = Object.assign(err, { message: err.message, name: err.name });
    
    // Default to 500 if undefined
    error.statusCode = error.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;

    // Handle Multer Errors early so they apply to both dev and prod
    if (error.name === 'MulterError' && !error.isOperational) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            error = new ApiError(HttpStatusCode.PAYLOAD_TOO_LARGE, 'File size is too large. Please upload a smaller file.');
        } else {
            error = new ApiError(HttpStatusCode.BAD_REQUEST, "We couldn't upload your file. Please try again.");
        }
    }

    // Handle Sequelize Database Errors
    if (error.name === 'SequelizeValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'SequelizeUniqueConstraintError') error = handleUniqueConstraintErrorDB(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') error = handleForeignKeyConstraintErrorDB(error);
    if (error.name === 'SequelizeConnectionError') error = handleConnectionErrorDB(error);
    if (error.name === 'SequelizeConnectionRefusedError') error = handleConnectionRefusedErrorDB(error);
    if (error.name === 'SequelizeConnectionTimedOutError') error = handleConnectionTimedOutErrorDB(error);
    if (error.name === 'SequelizeTimeoutError') error = handleTimeoutErrorDB(error);
    if (error.name === 'SequelizeDatabaseError') error = handleDatabaseErrorDB(error);
    if (error.name === 'SequelizeOptimisticLockError') error = handleOptimisticLockErrorDB(error);
    if (error.name === 'SequelizeExclusionConstraintError') error = handleExclusionConstraintErrorDB(error);
    if (error.name === 'SequelizeCheckConstraintError') error = handleCheckConstraintErrorDB(error);

    // Handle JWT Errors
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'NotBeforeError') error = handleJWTNotBeforeError();
    if (error.name === 'JsonWebTokenMalformedError') error = handleJWTMalformedError();

    // Handle other common Node.js errors
    if (error.code === 'ECONNREFUSED') error = handleConnectionRefusedErrorDB(error);
    if (error.code === 'ETIMEDOUT') error = handleConnectionTimedOutErrorDB(error);

    if (error.code === 'ENOTFOUND') {
        error = new ApiError(HttpStatusCode.SERVICE_UNAVAILABLE, "Service is temporarily unreachable. Please try again later.");
    }

    // Unhandled / generic errors
    if (!(error instanceof ApiError) && !error.isOperational) {
        error.statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
        error.message = "An unexpected error occurred. Our team has been notified.";
    }

    const response = {
        success: false,
        message: error.message,
        errors: error.errors || [],
        requestId: req.id,
        ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    };

    // Structured logging of the error
    if (error.statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR || !error.isOperational) {
        console.error('PROGRAMMING_OR_UNKNOWN_ERROR Caught by Global Handler:', {
            message: error.message,
            name: error.name,
            requestId: req.id,
            url: req.originalUrl,
            method: req.method,
            stack: error.stack
        });
    } else {
        console.warn(`Operational Error: ${error.message}`, {
            requestId: req.id,
            statusCode: error.statusCode,
            name: error.name
        });
    }
    
    res.status(error.statusCode).json(response);
};

export default errorMiddleware;
