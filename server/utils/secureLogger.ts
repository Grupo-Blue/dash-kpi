/**
 * Secure Logger - Sprint 1 Security Implementation
 * 
 * Features:
 * - Automatic masking of sensitive data (tokens, passwords, emails)
 * - Configurable log levels (debug, info, warn, error)
 * - Structured logging with timestamps
 * - Safe for production use
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class SecureLogger {
  private minLevel: LogLevel;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    // In production, only log info and above
    // In development, log everything
    const isProduction = process.env.NODE_ENV === 'production';
    this.minLevel = isProduction ? 'info' : 'debug';
  }

  /**
   * Mask sensitive data in strings
   */
  private maskSensitiveData(value: any): any {
    if (typeof value === 'string') {
      // Mask tokens (long alphanumeric strings)
      if (value.length > 32 && /^[A-Z0-9]+$/i.test(value)) {
        return this.maskToken(value);
      }
      
      // Mask email addresses
      if (value.includes('@')) {
        return this.maskEmail(value);
      }
      
      // Mask URLs with tokens
      if (value.includes('token=') || value.includes('key=')) {
        return this.maskUrlParams(value);
      }
    }
    
    if (typeof value === 'object' && value !== null) {
      return this.maskObject(value);
    }
    
    return value;
  }

  /**
   * Mask token (show first 4 and last 4 characters)
   */
  private maskToken(token: string): string {
    if (!token || token.length < 8) return '[MASKED]';
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
  }

  /**
   * Mask email (show first character and domain)
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '[MASKED_EMAIL]';
    return `${local[0]}***@${domain}`;
  }

  /**
   * Mask URL parameters
   */
  private maskUrlParams(url: string): string {
    return url.replace(/(token|key|password|secret)=([^&]+)/gi, '$1=[MASKED]');
  }

  /**
   * Mask sensitive fields in objects
   */
  private maskObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.maskSensitiveData(item));
    }
    
    const masked: any = {};
    const sensitiveKeys = [
      'token', 'apikey', 'api_key', 'apitoken', 'api_token',
      'password', 'secret', 'authorization', 'auth',
      'accesstoken', 'access_token', 'refreshtoken', 'refresh_token'
    ];
    
    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();
      
      // Mask sensitive keys
      if (sensitiveKeys.some(sk => keyLower.includes(sk))) {
        masked[key] = '[MASKED]';
        continue;
      }
      
      // Recursively mask nested objects
      masked[key] = this.maskSensitiveData(value);
    }
    
    return masked;
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  /**
   * Format log message
   */
  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);
    
    let log = `[${timestamp}] ${levelUpper} ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      const maskedContext = this.maskSensitiveData(context);
      log += ` ${JSON.stringify(maskedContext)}`;
    }
    
    return log;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.log(this.formatLog('debug', message, context));
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.log(this.formatLog('info', message, context));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatLog('warn', message, context));
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    
    console.error(this.formatLog('error', message, errorContext));
  }

  /**
   * Log API call
   */
  apiCall(service: string, endpoint: string, success: boolean, context?: LogContext): void {
    const level = success ? 'info' : 'error';
    const status = success ? 'SUCCESS' : 'FAILED';
    this[level](`API Call ${status}: ${service} - ${endpoint}`, context);
  }

  /**
   * Log authentication event
   */
  auth(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, {
      ...context,
      userId: userId ? this.maskToken(userId) : undefined,
    });
  }

  /**
   * Log database operation
   */
  db(operation: string, table: string, success: boolean, context?: LogContext): void {
    const level = success ? 'debug' : 'error';
    const status = success ? 'SUCCESS' : 'FAILED';
    this[level](`DB ${status}: ${operation} on ${table}`, context);
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Export for testing
export { SecureLogger };
