// lib/logger.ts
import { NextRequest } from 'next/server';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  request?: {
    method: string;
    url: string;
    ip?: string;
  };
}

const getLogLevel = (): LogLevel => {
  // Default to 'info' in production, 'debug' in development
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  if (['debug', 'info', 'warn', 'error', 'fatal'].includes(envLevel)) {
    return envLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

const currentLogLevel = getLogLevel();

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const log = (level: LogLevel, message: string, context?: Record<string, any>, error?: Error, request?: NextRequest) => {
  if (levels[level] < levels[currentLogLevel]) {
    return; // Do not log if current level is higher than requested level
  }

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context) {
    logEntry.context = context;
  }
  if (error) {
    logEntry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  if (request) {
    logEntry.request = {
      method: request.method,
      url: request.url,
      ip: request.ip,
    };
  }

  const logOutput = JSON.stringify(logEntry);

  // In a real application, this would go to a log aggregation service
  // For now, output to console, which Vercel will capture
  switch (level) {
    case 'debug':
      console.debug(logOutput);
      break;
    case 'info':
      console.info(logOutput);
      break;
    case 'warn':
      console.warn(logOutput);
      break;
    case 'error':
    case 'fatal':
      console.error(logOutput);
      // Placeholder for external alerting (e.g., Sentry.captureException(error))
      break;
  }
};

export const logger = {
  debug: (message: string, context?: Record<string, any>, request?: NextRequest) => log('debug', message, context, undefined, request),
  info: (message: string, context?: Record<string, any>, request?: NextRequest) => log('info', message, context, undefined, request),
  warn: (message: string, context?: Record<string, any>, request?: NextRequest) => log('warn', message, context, undefined, request),
  error: (message: string, error?: Error, context?: Record<string, any>, request?: NextRequest) => log('error', message, context, error, request),
  fatal: (message: string, error?: Error, context?: Record<string, any>, request?: NextRequest) => log('fatal', message, context, error, request),
};