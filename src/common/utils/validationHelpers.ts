// Centralized validation helpers

export const validateObjectId = (id: string, fieldName: string = 'ID'): void => {
  if (!id || typeof id !== 'string') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
};

export const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} is required`);
  }
};

export const validateStringLength = (value: string, fieldName: string, minLength: number, maxLength?: number): void => {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }

  if (maxLength && value.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }
};

export const validatePaginationParams = (page: number, pageSize: number): void => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error('Page must be a positive integer');
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error('Page size must be between 1 and 100');
  }
};

export const validateUserId = (userId: string): void => {
  validateObjectId(userId, 'User ID');
};

// Helper function for ObjectId validation
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
