import pino from 'pino';
import { User } from '../db/schema/users';

const transport = process.env.BASELIME_API_KEY ? pino.transport({
  target: '@baselime/pino-transport',
  options: { baselimeApiKey: process.env.BASELIME_API_KEY },
}) : pino.destination(1); // stdout

const pinoLogger = pino(transport);

export const customLogger = (
  statusCode: number,
  details: any,
  message: string,
  user?: Partial<User> | any
) => {
  const level = statusCode >= 400 ? 'error' : 'info';
  const userInfo = user?.id || user?.email || 'anonymous';

  // Simplified logging - just show controller & service info
  if (level === 'error') {
    const errorSource = details?.stack?.split('\n')[1]?.trim() || 'Unknown';
    pinoLogger.error(`[${userInfo}] ${message} | Source: ${errorSource}`);
  } else {
    pinoLogger.info(`[${userInfo}] ${message}`);
  }
};

// Application-specific logging functions
export const logError = (error: Error, context?: any, user?: any) => {
  customLogger(500, {
    error: error.message,
    stack: error.stack,
    context
  }, error.message, user);
};

export const logInfo = (message: string, data?: any, user?: any) => {
  customLogger(200, data, message, user);
};

export const logWarning = (message: string, data?: any, user?: any) => {
  customLogger(400, data, message, user);
};
