import mongoose, { Schema, Document } from 'mongoose';

export interface ILocationAddress {
  country: string;
  state?: string;
  city: string;
  timeZone: string;
  addressLine?: string;
  streetAddress: string;
  zip: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILocation extends Document {
  // Single address fields (instead of addresses array)
  country: string;
  state?: string;
  city: string;
  timeZone: string;
  addressLine?: string;
  streetAddress: string;
  zip: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ILocationActivity extends Document {
  locationId: mongoose.Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  performedBy: mongoose.Types.ObjectId;
  oldData?: any;
  newData?: any;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

const LocationAddressSchema = new Schema<ILocationAddress>({
  country: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  timeZone: {
    type: String,
    required: true,
    trim: true
  },
  addressLine: {
    type: String,
    trim: true
  },
  streetAddress: {
    type: String,
    required: true,
    trim: true
  },
  zip: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const LocationSchema = new Schema<ILocation>({
  // Single address fields (instead of addresses array)
  country: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  timeZone: {
    type: String,
    required: true,
    trim: true
  },
  addressLine: {
    type: String,
    trim: true
  },
  streetAddress: {
    type: String,
    required: true,
    trim: true
  },
  zip: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: Schema.Types.Mixed, // Allow both ObjectId and String
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add soft delete field
LocationSchema.add({
  deletedAt: {
    type: Date,
    default: null
  }
});

// Add index for soft delete
LocationSchema.index({ deletedAt: 1 });

const LocationActivitySchema = new Schema<ILocationActivity>({
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  oldData: {
    type: Schema.Types.Mixed
  },
  newData: {
    type: Schema.Types.Mixed
  },
  changes: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
LocationActivitySchema.index({ locationId: 1, createdAt: -1 });
LocationActivitySchema.index({ performedBy: 1, createdAt: -1 });

// Models moved to src/models/Location.ts to prevent recompilation
