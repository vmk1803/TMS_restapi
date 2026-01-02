import argon2 from 'argon2';
import mongoose from 'mongoose';
import User, { IUser, UserActivity } from '../../models/User';
import UserDao, { UserServiceQuery } from '../../dao/userDao';
import { BaseService } from '../BaseService';
import { AppError } from '../../common/errors/AppError';
import { CreateUserPayload, UpdateUserPayload } from '../../types/user';

class UserService extends BaseService<IUser> {
    private userDao = new UserDao();

    constructor() {
        super(User);
    }

    /**
     * Hash password using Argon2
     */
    async hashPassword(password: string): Promise<string> {
        try {
            return await argon2.hash(password);
        } catch (error: any) {
            throw AppError.internal('Failed to hash password');
        }
    }

    /**
     * Compare password with hash using Argon2
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, password);
        } catch (error: any) {
            throw AppError.internal('Failed to verify password');
        }
    }

    /**
     * Generate random password (8 characters alphanumeric with special char)
     */
    generateRandomPassword(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    /**
     * Create new user
     */
    async createUser(payload: CreateUserPayload, createdBy: string): Promise<IUser> {
        try {
            // Check if email already exists
            const emailExists = await this.userDao.emailExists(payload.email);
            if (emailExists) {
                throw AppError.conflict('Email already exists');
            }

            // Prevent user from being their own reporting manager
            if (payload.organizationDetails?.reportingManager && payload.organizationDetails.reportingManager === createdBy) {
                throw AppError.badRequest('User cannot be their own reporting manager');
            }

            // Validate reporting manager exists if provided
            if (payload.organizationDetails?.reportingManager) {
                const reportingManager = await this.findById(payload.organizationDetails.reportingManager);
                if (!reportingManager) {
                    throw AppError.notFound('Reporting manager not found');
                }
            }

            // Determine password
            let password = payload.password;
            if (!password) {
                if (payload.passwordSetting === 'auto-generate') {
                    password = this.generateRandomPassword();
                } else {
                    throw AppError.badRequest('Password is required for manual password setting');
                }
            }

            // Hash password
            const hashedPassword = await this.hashPassword(password);

            // Convert string IDs to ObjectIds
            const userData: any = {
                ...payload,
                email: payload.email.toLowerCase(),
                password: hashedPassword,
                organizationDetails: payload.organizationDetails ? {
                    role: new mongoose.Types.ObjectId(payload.organizationDetails.role),
                    department: new mongoose.Types.ObjectId(payload.organizationDetails.department),
                    organization: new mongoose.Types.ObjectId(payload.organizationDetails.organization),
                    location: new mongoose.Types.ObjectId(payload.organizationDetails.location),
                    reportingManager: payload.organizationDetails.reportingManager
                        ? new mongoose.Types.ObjectId(payload.organizationDetails.reportingManager)
                        : undefined
                } : undefined
            };

            // Create user
            const user = await this.create(userData);

            // Log activity
            await this.logActivity({
                userId: user._id!,
                action: 'CREATE',
                performedBy: new mongoose.Types.ObjectId(createdBy),
                newData: this.sanitizeUserForLogging(user)
            });

            return user;
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw this.handleError(error, 'createUser');
        }
    }

    /**
     * Update user
     */
    async updateUser(userId: string, payload: UpdateUserPayload, updatedBy: string): Promise<IUser> {
        try {
            // Get existing user
            const existingUser = await this.findById(userId);
            if (!existingUser) {
                throw AppError.notFound('User not found');
            }

            // Check if new email already exists (if email is being updated)
            if (payload.email && payload.email !== existingUser.email) {
                const emailExists = await this.userDao.emailExists(payload.email, userId);
                if (emailExists) {
                    throw AppError.conflict('Email already exists');
                }
            }

            // Prevent user from being their own reporting manager
            if (payload.organizationDetails?.reportingManager && payload.organizationDetails.reportingManager === userId) {
                throw AppError.badRequest('User cannot be their own reporting manager');
            }

            // Validate reporting manager exists if provided
            if (payload.organizationDetails?.reportingManager) {
                const reportingManager = await this.findById(payload.organizationDetails.reportingManager);
                if (!reportingManager) {
                    throw AppError.notFound('Reporting manager not found');
                }
            }

            // Build update object
            const updateData: any = {};

            if (payload.firstName) updateData.firstName = payload.firstName;
            if (payload.lastName) updateData.lastName = payload.lastName;
            if (payload.email) updateData.email = payload.email.toLowerCase();
            if (payload.mobileNumber) updateData.mobileNumber = payload.mobileNumber;
            if (payload.active !== undefined) updateData.active = payload.active;
            if (payload.gender) updateData.gender = payload.gender;
            if (payload.assets !== undefined) updateData.assets = payload.assets;
            if (payload.passwordSetting) updateData.passwordSetting = payload.passwordSetting;

            // Handle password update
            if (payload.password) {
                updateData.password = await this.hashPassword(payload.password);
            }

            // Handle organization details
            if (payload.organizationDetails) {
                updateData.organizationDetails = {
                    role: payload.organizationDetails.role
                        ? new mongoose.Types.ObjectId(payload.organizationDetails.role)
                        : (existingUser.organizationDetails?.role || null),
                    department: payload.organizationDetails.department
                        ? new mongoose.Types.ObjectId(payload.organizationDetails.department)
                        : (existingUser.organizationDetails?.department || null),
                    organization: payload.organizationDetails.organization
                        ? new mongoose.Types.ObjectId(payload.organizationDetails.organization)
                        : (existingUser.organizationDetails?.organization || null),
                    location: payload.organizationDetails.location
                        ? new mongoose.Types.ObjectId(payload.organizationDetails.location)
                        : (existingUser.organizationDetails?.location || null),
                    reportingManager: payload.organizationDetails.reportingManager
                        ? new mongoose.Types.ObjectId(payload.organizationDetails.reportingManager)
                        : (existingUser.organizationDetails?.reportingManager || undefined)
                };
            }

            // Update user
            const updatedUser = await this.model.findByIdAndUpdate(userId, updateData, { new: true });

            if (!updatedUser) {
                throw AppError.notFound('User not found');
            }

            // Log activity
            await this.logActivity({
                userId: new mongoose.Types.ObjectId(userId),
                action: 'UPDATE',
                performedBy: new mongoose.Types.ObjectId(updatedBy),
                oldData: this.sanitizeUserForLogging(existingUser),
                newData: this.sanitizeUserForLogging(updatedUser),
                changes: this.getChanges(existingUser, updatedUser)
            });

            return updatedUser;
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw this.handleError(error, 'updateUser');
        }
    }

    /**
     * Delete user (soft delete)
     */
    async deleteUser(userId: string, deletedBy: string): Promise<void> {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw AppError.notFound('User not found');
            }

            await this.userDao.softDeleteUser(userId);

            // Log activity
            await this.logActivity({
                userId: new mongoose.Types.ObjectId(userId),
                action: 'DELETE',
                performedBy: new mongoose.Types.ObjectId(deletedBy),
                oldData: this.sanitizeUserForLogging(user)
            });
        } catch (error: any) {
            if (error.statusCode) throw error;
            throw this.handleError(error, 'deleteUser');
        }
    }

    /**
     * Get user by ID with details
     */
    async getUserWithDetails(userId: string): Promise<IUser | null> {
        try {
            return await this.userDao.getUserWithDetails(userId);
        } catch (error: any) {
            throw this.handleError(error, 'getUserWithDetails');
        }
    }

    /**
     * Get users with pagination
     */
    async getUsersPaginated(query: UserServiceQuery) {
        try {
            return await this.userDao.getUsersWithDetails(query);
        } catch (error: any) {
            throw this.handleError(error, 'getUsersPaginated');
        }
    }

    /**
     * Get users by organization
     */
    async getUsersByOrganization(organizationId: string): Promise<IUser[]> {
        try {
            return await this.userDao.getUsersByOrganization(organizationId);
        } catch (error: any) {
            throw this.handleError(error, 'getUsersByOrganization');
        }
    }

    /**
     * Get users by department
     */
    async getUsersByDepartment(departmentId: string): Promise<IUser[]> {
        try {
            return await this.userDao.getUsersByDepartment(departmentId);
        } catch (error: any) {
            throw this.handleError(error, 'getUsersByDepartment');
        }
    }

    /**
     * Get users by role
     */
    async getUsersByRole(roleId: string): Promise<IUser[]> {
        try {
            return await this.userDao.getUsersByRole(roleId);
        } catch (error: any) {
            throw this.handleError(error, 'getUsersByRole');
        }
    }

    /**
     * Get all users without pagination
     */
    async getAllUsers(): Promise<IUser[]> {
        try {
            const users = await this.findAll(
                { deletedAt: null },
                undefined,
                'organizationDetails.role organizationDetails.department organizationDetails.organization organizationDetails.location'
            );

            return users;
        } catch (error: any) {
            throw this.handleError(error, 'getAllUsers');
        }
    }

    /**
     * Log user activity for audit trail
     */
    private async logActivity(data: any): Promise<void> {
        try {
            const activity = new UserActivity(data);
            await activity.save();
        } catch (error) {
            // Don't throw error for failed logging - it's non-critical
            console.error('Failed to log user activity:', error);
        }
    }

    /**
     * Sanitize user data for logging (exclude password)
     */
    private sanitizeUserForLogging(user: any): any {
        const obj = user.toObject ? user.toObject() : user;
        const { password, ...sanitized } = obj;
        return sanitized;
    }

    /**
     * Get changes between two user objects
     */
    private getChanges(oldUser: any, newUser: any): any {
        const changes: any = {};
        const oldObj = oldUser.toObject ? oldUser.toObject() : oldUser;
        const newObj = newUser.toObject ? newUser.toObject() : newUser;

        const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

        for (const key of allKeys) {
            if (key === 'password') continue; // Don't log password changes in detail
            if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
                changes[key] = {
                    old: oldObj[key],
                    new: newObj[key]
                };
            }
        }

        return Object.keys(changes).length > 0 ? changes : null;
    }
}

export default UserService;
