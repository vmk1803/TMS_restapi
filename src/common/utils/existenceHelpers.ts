import { AppError } from '../errors/AppError';

export const ensureExists = <T>(
  entity: T | null | undefined,
  entityName: string,
  identifier?: string
): T => {
  if (!entity) {
    const message = identifier
      ? `${entityName} with identifier '${identifier}' not found`
      : `${entityName} not found`;
    throw AppError.notFound(message);
  }
  return entity;
};

export const ensureNotExists = <T>(
  entity: T | null | undefined,
  entityName: string,
  identifier?: string
): void => {
  if (entity) {
    const message = identifier
      ? `${entityName} with identifier '${identifier}' already exists`
      : `${entityName} already exists`;
    throw AppError.conflict(message);
  }
};
