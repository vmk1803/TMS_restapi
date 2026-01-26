import mongoose, { Model, Document, UpdateQuery, QueryOptions } from 'mongoose';
import { AppError, ErrorType } from '../common/errors/AppError';

type FilterQuery<T> = any; // Using any for simplicity, mongoose.FilterQuery is not directly exported

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total_records: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    next_page: number | null;
    prev_page: number | null;
  };
}

export class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async findAll(
    filter: FilterQuery<T> = {},
    options: QueryOptions = {},
    populate?: string | string[]
  ): Promise<T[]> {
    try {
      let query = this.model.find(filter, null, options);

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      return await query.exec();
    } catch (error: any) {
      throw this.handleError(error, 'findAll');
    }
  }

  async findById(
    id: string,
    populate?: string | string[]
  ): Promise<T | null> {
    try {
      let query = this.model.findById(id);

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      return await query.exec();
    } catch (error: any) {
      throw this.handleError(error, 'findById');
    }
  }

  async findOne(
    filter: FilterQuery<T>,
    populate?: string | string[]
  ): Promise<T | null> {
    try {
      let query = this.model.findOne(filter);

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      return await query.exec();
    } catch (error: any) {
      throw this.handleError(error, 'findOne');
    }
  }

  async updateById(
    id: string,
    updateData: UpdateQuery<T>,
    options: QueryOptions = { new: true },
    populate?: string | string[]
  ): Promise<T | null> {
    try {
      let query = this.model.findByIdAndUpdate(id, updateData, options);

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      return await query.exec();
    } catch (error: any) {
      throw this.handleError(error, 'updateById');
    }
  }

  async updateOne(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    options: QueryOptions = { new: true },
    populate?: string | string[]
  ): Promise<T | null> {
    try {
      let query = this.model.findOneAndUpdate(filter, updateData, options);

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      return await query.exec();
    } catch (error: any) {
      throw this.handleError(error, 'updateOne');
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return !!result;
    } catch (error: any) {
      throw this.handleError(error, 'deleteById');
    }
  }

  async softDeleteById(id: string, deletedAtField: string = 'deletedAt'): Promise<boolean> {
    try {
      const updateData: any = {};
      updateData[deletedAtField] = new Date();

      const result = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      return !!result;
    } catch (error: any) {
      throw this.handleError(error, 'softDeleteById');
    }
  }

  async softDeleteByIds(ids: string[], deletedAtField: string = 'deletedAt'): Promise<{ success: string[], failed: string[], successCount: number, failedCount: number }> {
    try {
      const updateData: any = {};
      updateData[deletedAtField] = new Date();

      const results = {
        success: [] as string[],
        failed: [] as string[],
        successCount: 0,
        failedCount: 0
      };

      // Process each ID individually to handle partial failures
      for (const id of ids) {
        try {
          const result = await this.model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
          );
          
          if (result) {
            results.success.push(id);
            results.successCount++;
          } else {
            results.failed.push(id);
            results.failedCount++;
          }
        } catch (error: any) {
          results.failed.push(id);
          results.failedCount++;
        }
      }

      return results;
    } catch (error: any) {
      throw this.handleError(error, 'softDeleteByIds');
    }
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter);
    } catch (error: any) {
      throw this.handleError(error, 'countDocuments');
    }
  }

  async findWithPagination(
    filter: FilterQuery<T> = {},
    pagination: PaginationOptions = {},
    sort: any = { createdAt: -1 },
    populate?: string | string[]
  ): Promise<PaginatedResult<T>> {
    try {
      const { page = 1, pageSize = 10 } = pagination;
      const skip = (page - 1) * pageSize;

      const totalRecords = await this.countDocuments(filter);
      const totalPages = Math.ceil(totalRecords / pageSize);

      let query = this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize);

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach(pop => query = query.populate(pop));
        } else {
          query = query.populate(populate);
        }
      }

      const data = await query.exec();

      return {
        data,
        pagination: {
          total_records: totalRecords,
          total_pages: totalPages,
          page_size: pageSize,
          current_page: Math.min(page, totalPages),
          next_page: page >= totalPages ? null : page + 1,
          prev_page: page <= 1 ? null : page - 1,
        }
      };
    } catch (error: any) {
      throw this.handleError(error, 'findWithPagination');
    }
  }

  protected handleError(error: any, operation: string): AppError {
    console.error(`BaseService.${operation} error:`, error);

    if (error.name === 'ValidationError') {
      return new AppError(
        ErrorType.BAD_REQUEST,
        `Validation failed during ${operation}`,
        400,
        true,
        error.message
      );
    }

    if (error.name === 'CastError') {
      return new AppError(
        ErrorType.BAD_REQUEST,
        `Invalid ID format during ${operation}`,
        400,
        true
      );
    }

    if (error.code === 11000) {
      return new AppError(
        ErrorType.CONFLICT,
        `Duplicate key error during ${operation}`,
        409,
        true
      );
    }

    return new AppError(
      ErrorType.INTERNAL_SERVER_ERROR,
      `Database operation failed during ${operation}`,
      500,
      false,
      error.message
    );
  }
}
