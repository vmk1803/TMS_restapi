import { LocationActivity, ILocationActivity } from '../../models/Location';
import { logError } from '../../utils/logger';

export interface LogActivityData {
  locationId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  performedBy: string;
  oldData?: any;
  newData?: any;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

class LocationActivityService {
  /**
   * Log a location activity
   */
  async logActivity(data: LogActivityData): Promise<ILocationActivity> {
    try {
      const activityData = {
        locationId: data.locationId,
        action: data.action,
        performedBy: data.performedBy,
        oldData: data.oldData,
        newData: data.newData,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      };

      const activity = new LocationActivity(activityData);
      return await activity.save();
    } catch (error: any) {
      logError(error, { data, function: 'logActivity', file: 'locationActivityService.ts' });
      throw error;
    }
  }

  /**
   * Get activity history for a location
   */
  async getLocationActivityHistory(locationId: string, limit: number = 50): Promise<ILocationActivity[]> {
    try {
      return await LocationActivity.find({ locationId })
        .populate('performedBy', 'fname lname email')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error: any) {
      logError(error, { locationId, function: 'getLocationActivityHistory', file: 'locationActivityService.ts' });
      throw error;
    }
  }

  /**
   * Get activity history for a user
   */
  async getUserActivityHistory(userId: string, limit: number = 50): Promise<ILocationActivity[]> {
    try {
      return await LocationActivity.find({ performedBy: userId })
        .populate('locationId', 'country city streetAddress')
        .populate('performedBy', 'fname lname email')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error: any) {
      logError(error, { userId, function: 'getUserActivityHistory', file: 'locationActivityService.ts' });
      throw error;
    }
  }

  /**
   * Calculate changes between old and new data
   */
  calculateChanges(oldData: any, newData: any): any {
    const changes: any = {};

    if (!oldData || !newData) return changes;

    // Compare each field
    const fields = ['country', 'state', 'city', 'timeZone', 'addressLine', 'streetAddress', 'zip'];

    fields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes[field] = {
          from: oldData[field],
          to: newData[field]
        };
      }
    });

    return changes;
  }
}

export default LocationActivityService;
