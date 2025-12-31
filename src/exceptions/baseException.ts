class BaseException extends Error {
  public readonly statusCode: number;
  public readonly name: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, name: string, isOperational: boolean) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export default BaseException;
