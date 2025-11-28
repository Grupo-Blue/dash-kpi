/**
 * Structured Logging System using Winston
 * 
 * Features:
 * - JSON format for production, colorized console for development
 * - Daily rotating files with automatic cleanup
 * - Configurable log levels via LOG_LEVEL environment variable
 * - Automatic masking of sensitive data (tokens, passwords, emails)
 * - Separate files for errors and combined logs
 * 
 * Usage:
 * import { logger } from './logger';
 * logger.debug('Debug message', { data });
 * logger.info('Info message');
 * logger.warn('Warning message');
 * logger.error('Error message', error);
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Use global __dirname injected by Vite (defined in vite.config.ts)

// Determine log level from environment (default: info)
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Determine if we're in production
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Log directory
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../../logs');

/**
 * Mask sensitive data in log messages
 */
function maskSensitiveData(value: any): any {
  if (typeof value === 'string') {
    let masked = value;
    
    // Mask tokens (keep first 4 chars)
    masked = masked.replace(/([Tt]oken[:\s=]+)([A-Za-z0-9_-]{4})[A-Za-z0-9_-]+/g, '$1$2...');
    masked = masked.replace(/([Bb]earer\s+)([A-Za-z0-9_-]{4})[A-Za-z0-9_-]+/g, '$1$2...');
    
    // Mask API keys (keep first 4 chars)
    masked = masked.replace(/([Aa]pi[Kk]ey[:\s=]+)([A-Za-z0-9_-]{4})[A-Za-z0-9_-]+/g, '$1$2...');
    
    // Mask passwords
    masked = masked.replace(/([Pp]assword[:\s=]+)([^\s,}]+)/g, '$1***');
    masked = masked.replace(/([Pp]ass[:\s=]+)([^\s,}]+)/g, '$1***');
    
    // Mask email addresses (keep first 2 chars and domain)
    masked = masked.replace(/\b([a-zA-Z0-9]{1,2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, '$1***@$2');
    
    // Mask URLs with tokens/keys in query params
    masked = masked.replace(/([?&](token|key|apikey|api_key|password|pass)=)([^&\s]+)/gi, '$1***');
    
    return masked;
  }
  
  if (Array.isArray(value)) {
    return value.map(maskSensitiveData);
  }
  
  if (value && typeof value === 'object') {
    const masked: any = {};
    for (const key in value) {
      // Mask specific keys
      if (/token|key|password|pass|secret|auth/i.test(key)) {
        if (typeof value[key] === 'string' && value[key].length > 4) {
          masked[key] = value[key].substring(0, 4) + '...';
        } else {
          masked[key] = '***';
        }
      } else {
        masked[key] = maskSensitiveData(value[key]);
      }
    }
    return masked;
  }
  
  return value;
}

/**
 * Custom format to mask sensitive data
 */
const maskFormat = winston.format((info) => {
  if (info.message) {
    info.message = maskSensitiveData(info.message);
  }
  
  // Also mask in metadata
  if (info.meta) {
    info.meta = maskSensitiveData(info.meta);
  }
  
  // Mask error details
  if (info.error) {
    info.error = maskSensitiveData(info.error);
  }
  
  return info;
})();

/**
 * Console format for development (colorized, human-readable)
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  maskFormat,
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    const metaKeys = Object.keys(meta).filter(k => k !== 'timestamp' && k !== 'level' && k !== 'message');
    if (metaKeys.length > 0) {
      const metaObj: any = {};
      metaKeys.forEach(k => metaObj[k] = meta[k]);
      log += `\n${JSON.stringify(metaObj, null, 2)}`;
    }
    
    return log;
  })
);

/**
 * JSON format for production (structured, machine-readable)
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  maskFormat,
  winston.format.json()
);

/**
 * Create transports array
 */
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: IS_PRODUCTION ? jsonFormat : consoleFormat,
  })
);

// File transports (only in production or if LOG_DIR is set)
if (IS_PRODUCTION || process.env.LOG_DIR) {
  // Combined logs (all levels)
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      format: jsonFormat,
    })
  );
  
  // Error logs (error level only)
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d', // Keep error logs for 30 days
      format: jsonFormat,
    })
  );
}

/**
 * Create Winston logger instance
 */
const winstonLogger = winston.createLogger({
  level: LOG_LEVEL,
  transports,
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

/**
 * Logger class maintaining backward compatibility
 */
class Logger {
  debug(message: string, context?: any): void {
    winstonLogger.debug(message, context);
  }

  info(message: string, context?: any): void {
    winstonLogger.info(message, context);
  }

  warn(message: string, context?: any): void {
    winstonLogger.warn(message, context);
  }

  error(message: string, error?: Error | any, context?: any): void {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    winstonLogger.error(message, { ...context, error: errorDetails });
  }
}

/**
 * Export logger instance
 */
export const logger = new Logger();

/**
 * Export Winston instance for advanced usage
 */
export default winstonLogger;
