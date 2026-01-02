import mongoose, { Schema, Document, Model } from 'mongoose';
import { PERMISSIONS } from '../constants/appMessages';

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: {
    projects: string[];
    task: string[];
    users: string[];
    settings: string[];
  };
  userCount?: number; // Added for aggregation results
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: {
    projects: [{ type: String, enum: Object.values(PERMISSIONS) }],
    task: [{ type: String, enum: Object.values(PERMISSIONS) }],
    users: [{ type: String, enum: Object.values(PERMISSIONS) }],
    settings: [{ type: String, enum: Object.values(PERMISSIONS) }]
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Compound unique index to ensure role name is unique
RoleSchema.index({ name: 1 }, { unique: true });

// Prevent model recompilation
const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
