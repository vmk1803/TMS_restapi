import express, { Router } from "express";
import LocationController from "../../controllers/locationController";
import { requireUserRoleForLocations, requireUserOrAdminRole } from "../../common/middlewares/checkUserRole";
import { isAuthorized } from "../../common/middlewares/auth";

const locationRouter: Router = express.Router();
const locationController = new LocationController();

// Location CRUD routes
// Only admin can create, update, delete locations
locationRouter.post('/', isAuthorized, requireUserRoleForLocations, locationController.createLocation);
locationRouter.patch('/:id', isAuthorized, requireUserRoleForLocations, locationController.updateLocation);
locationRouter.delete('/:id', isAuthorized, requireUserRoleForLocations, locationController.deleteLocation);

// Export locations as CSV
locationRouter.post('/export-csv', isAuthorized, requireUserOrAdminRole, locationController.exportLocationsCSV);

// Read operations are available to authenticated users (users and admins)
locationRouter.get('/', isAuthorized, requireUserOrAdminRole, locationController.getLocationsPaginated);
locationRouter.get('/all', isAuthorized, requireUserOrAdminRole, locationController.getAllLocations);
locationRouter.get('/my', isAuthorized, requireUserOrAdminRole, locationController.getMyLocations);
locationRouter.get('/:id', isAuthorized, requireUserOrAdminRole, locationController.getLocationById);

export default locationRouter;
