import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  organization: mongoose.Types.ObjectId;
  headOfDepartment?: mongoose.Types.ObjectId;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DepartmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  headOfDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    required: true,
    default: 'active',
    trim: true
  }
}, {
  timestamps: true
});

// Compound unique index to ensure department name is unique within each organization
DepartmentSchema.index({ name: 1, organization: 1 }, { unique: true });

// Prevent model recompilation
const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
