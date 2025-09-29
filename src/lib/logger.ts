type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString()
    };
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) return data;
    
    // If it's a string, truncate if too long
    if (typeof data === 'string') {
      return data.length > 200 ? data.substring(0, 200) + '...' : data;
    }
    
    // If it's an object, sanitize sensitive fields
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data } as Record<string, unknown>;
      
      // Remove or mask sensitive fields
      const sensitiveFields = ['apiKey', 'password', 'token', 'secret', 'key'];
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          if (typeof sanitized[field] === 'string') {
            sanitized[field] = (sanitized[field] as string).substring(0, 8) + '...';
          } else {
            sanitized[field] = '[REDACTED]';
          }
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    
    const logEntry = this.formatMessage(level, message, data);
    
    if (this.isClient) {
      // Client-side logging
      const style = this.getConsoleStyle(level);
      console.log(`%c[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`, style, logEntry.data || '');
    } else {
      // Server-side logging
      console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`, logEntry.data || '');
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      info: 'color: #2563eb; font-weight: bold;',
      warn: 'color: #d97706; font-weight: bold;',
      error: 'color: #dc2626; font-weight: bold;',
      debug: 'color: #6b7280; font-weight: bold;'
    };
    return styles[level];
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();
