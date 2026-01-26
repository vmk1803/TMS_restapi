import express, { Router } from "express";
import OrganizationController from "../../controllers/organizationController";
import { authenticateToken } from "../../common/middlewares/auth";
import { checkUserRole } from "../../common/middlewares/checkUserRole";

const organizationRouter: Router = express.Router();
const organizationController = new OrganizationController();

// Public read operations (no authentication required)
organizationRouter.get('/my', authenticateToken, organizationController.getMyOrganizations); // /my before /:id
organizationRouter.get('/all', authenticateToken, organizationController.getAllOrganizations);
organizationRouter.get('/:id', organizationController.getOrganizationById);
organizationRouter.get('/', organizationController.getOrganizationsPaginated);

// Create, update, delete - only for Admin/Manager
organizationRouter.post('/', authenticateToken, checkUserRole(['admin', 'super_admin', 'hod', 'user']), organizationController.createOrganization);
organizationRouter.post('/bulk-update', authenticateToken, checkUserRole(['admin', 'super_admin', 'hod', 'user']), organizationController.bulkUpdateStatus);
organizationRouter.patch('/:id', authenticateToken, checkUserRole(['admin', 'super_admin', 'hod', 'user']), organizationController.updateOrganization);
organizationRouter.delete('/:id', authenticateToken, checkUserRole(['admin', 'super_admin', 'hod', 'user']), organizationController.deleteOrganization);

// Export organizations as CSV
organizationRouter.post('/export-csv', authenticateToken, organizationController.exportOrganizationsCSV);

export default organizationRouter;
