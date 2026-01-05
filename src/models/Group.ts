import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  department: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  // Virtual field
  id: string;
}

export interface IGroupActivity extends Document {
  groupId: mongoose.Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  performedBy: mongoose.Types.ObjectId;
  oldData?: any;
  newData?: any;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  description: {
    type: String,
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
GroupSchema.add({
  deletedAt: {
    type: Date,
    default: null
  }
});

// Add index for soft delete
GroupSchema.index({ deletedAt: 1 });

// Add virtual 'id' field that returns _id as string
GroupSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialized
GroupSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const GroupActivitySchema = new Schema<IGroupActivity>({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
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
GroupActivitySchema.index({ groupId: 1, createdAt: -1 });
GroupActivitySchema.index({ performedBy: 1, createdAt: -1 });

// Prevent model recompilation
const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
const GroupActivity: Model<IGroupActivity> = mongoose.models.GroupActivity || mongoose.model<IGroupActivity>('GroupActivity', GroupActivitySchema);

export { Group, GroupActivity };
export default Group;
