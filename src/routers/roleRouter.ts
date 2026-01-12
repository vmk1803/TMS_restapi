import express, { Router } from "express";
import RoleController from "../controllers/roleController";
import { authenticateToken } from "../common/middlewares/auth";

const roleRouter: Router = express.Router();
const roleController = new RoleController();

// Create role - requires authentication
roleRouter.post('/', authenticateToken, roleController.createRole);

// Update role - requires authentication
roleRouter.patch('/:id', authenticateToken, roleController.updateRole);

// Delete role - requires authentication
roleRouter.delete('/:id', authenticateToken, roleController.deleteRole);

// Export roles as CSV
roleRouter.post('/export-csv', authenticateToken, roleController.exportRolesCSV);

// Public read operations (no authentication required)
// Get all roles (no pagination) - must be before /:id route
roleRouter.get('/all', authenticateToken, roleController.getAllRoles);

roleRouter.get('/:id', roleController.getRoleById);
roleRouter.get('/', roleController.getRolesPaginated);

export default roleRouter;
