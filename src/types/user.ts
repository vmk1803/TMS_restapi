import { Types } from 'mongoose';

export interface IAsset {
  assetId: string;
  assetName: string;
}

export interface IOrganizationDetails {
  role: Types.ObjectId;
  department: Types.ObjectId;
  organization: Types.ObjectId;
  location: Types.ObjectId;
  reportingManager?: Types.ObjectId | null;
}

export interface IUser {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  active: boolean;
  middleName?: string;
  profilePic?: string;
  designation?: string;
  organizationDetails?: IOrganizationDetails;
  password?: string;
  passwordSetting?: 'manual' | 'auto-generate';
  assets?: IAsset[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  active?: boolean;
  organizationDetails?: {
    role: string; // Will be validated as ObjectId
    department: string;
    organization: string;
    location: string;
    reportingManager?: string | null; // Optional ObjectId
  };
  password?: string; // Optional if auto-generate
  passwordSetting?: 'manual' | 'auto-generate';
  profilePic?: string;
  assets?: IAsset[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  gender?: string;
  active?: boolean;
  organizationDetails?: {
    role?: string;
    department?: string;
    organization?: string;
    location?: string;
    reportingManager?: string | null;
  };
  password?: string;
  passwordSetting?: 'manual' | 'auto-generate';
  profilePic?: string;
  assets?: IAsset[];
}

export interface UserResponse extends IUser {
  id?: string;
}

export interface UserListResponse {
  _id: string;
  firstName: string;
  lastName: string;
  emailId: string;
  mobileNumber: string;
  gender: string;
  organizationDetails: {
    role: any;
    department: any;
    organization: any;
    location: any;
    reportingManager?: any;
  };
  passwordSetting: string;
  userStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
