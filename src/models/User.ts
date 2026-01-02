import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAsset {
  assetId: string;
  assetName: string;
}

export interface IOrganizationDetails {
  role: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  reportingManager?: mongoose.Types.ObjectId;
}

export interface IUser extends Document {
  // Required Personal Details
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  active: boolean;

  // Optional Personal Details
  middleName?: string;
  profilePic?: string;
  designation?: string;

  // Optional Organization References
  organizationDetails?: IOrganizationDetails;

  // Optional Other Fields
  password?: string;
  passwordSetting?: 'manual' | 'auto-generate';
  assets?: IAsset[];

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  // Virtual field
  id: string;
}

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  performedBy: mongoose.Types.ObjectId;
  oldData?: any;
  newData?: any;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

// Asset Schema
const AssetSchema = new Schema<IAsset>(
  {
    assetId: {
      type: String,
      required: true,
      trim: true
    },
    assetName: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

// Organization Details Schema
const OrganizationDetailsSchema = new Schema<IOrganizationDetails>(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { _id: false }
);

// Main User Schema
const UserSchema = new Schema<IUser>(
  {
    // Required Personal Details
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      required: true,
      trim: true
    },
    active: {
      type: Boolean,
      required: true,
      default: true
    },

    // Optional Personal Details
    middleName: {
      type: String,
      trim: true
    },
    profilePic: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },

    // Optional Organization References
    organizationDetails: {
      type: OrganizationDetailsSchema
    },

    // Optional Other Fields
    password: {
      type: String
    },
    passwordSetting: {
      type: String,
      enum: ['manual', 'auto-generate'],
      default: 'auto-generate'
    },
    assets: {
      type: [AssetSchema],
      default: []
    },

    // Soft Delete
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for createdAt
UserSchema.index({ createdAt: -1 });
// Index for soft delete queries
UserSchema.index({ deletedAt: 1 });

// Activity Schema
const UserActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Create Models with safety check
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
const UserActivity: Model<IUserActivity> = mongoose.models.UserActivity || mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);

export { User, UserActivity };
export default User;
