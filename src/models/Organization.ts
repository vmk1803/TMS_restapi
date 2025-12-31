import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrganization extends Document {
  organizationName: string; // Renamed from 'name'
  email: string;
  contactNumber: string;
  description: string;
  primaryAdmin?: mongoose.Types.ObjectId;
  locations: mongoose.Types.ObjectId[]; // Array of location IDs
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  organizationName: { // Renamed from 'name'
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  primaryAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  locations: [{
    type: Schema.Types.ObjectId,
    ref: 'Location'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add soft delete field
OrganizationSchema.add({
  deletedAt: {
    type: Date,
    default: null
  }
});

// Add index for soft delete
OrganizationSchema.index({ deletedAt: 1 });

// Add unique index for email
OrganizationSchema.index({ email: 1 }, { unique: true });

// Prevent model recompilation
const Organization: Model<IOrganization> = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;
