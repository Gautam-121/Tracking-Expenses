import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import env from './config/env.js';
import HttpStatusCode from './utils/HttpStatusCode.js';
import ApiError from './utils/ApiError.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import sequelize from './config/database.js';
import indexRouter from './routes/index.js';


const app = express();

// Trust the first proxy in front of the app (e.g., Nginx, Heroku, AWS ELB)
app.set('trust proxy', 1);
app.use(helmet());

// Security headers configuration
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    'script-src': ["'self'"],
    'object-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:"],
    'worker-src': ["'self'", "blob:"],
    'connect-src': ["'self'", "blob:"],
  },
}));
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.noSniff());
app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true }));
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : [];
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin.trim())) {
      callback(null, true);
    } else {
      callback(new ApiError(HttpStatusCode.FORBIDDEN, 'Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ limit: '50kb', extended: true }));

// Prevent HTTP Parameter Pollution
app.use(hpp());

// --- API Routes ---
app.use('/api/v1', indexRouter);


// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(HttpStatusCode.NOT_FOUND, `The requested API endpoint "${req.originalUrl}" could not be found. Please check the URL or refer to the API documentation`));
});

// --- Global Error Handler (Standardized) ---
app.use(errorMiddleware);

export default app;
