import mongoose, { Schema, Document, Model } from 'mongoose';

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
  // Virtual field
  id: string;
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

// Add virtual 'id' field that returns _id as string
LocationSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
LocationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

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

// Prevent model recompilation
const Location: Model<ILocation> = mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);
const LocationAddress: Model<ILocationAddress> = mongoose.models.LocationAddress || mongoose.model<ILocationAddress>('LocationAddress', LocationAddressSchema);
const LocationActivity: Model<ILocationActivity> = mongoose.models.LocationActivity || mongoose.model<ILocationActivity>('LocationActivity', LocationActivitySchema);

export { Location, LocationAddress, LocationActivity };
export default Location;
