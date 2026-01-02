import express, { Router } from "express";
import DepartmentController from "../controllers/departmentController";
import { authenticateToken } from "../common/middlewares/auth";

const departmentRouter: Router = express.Router();
const departmentController = new DepartmentController();

// Create department - requires authentication
departmentRouter.post('/', authenticateToken, departmentController.createDepartment);

// Update department - requires authentication
departmentRouter.patch('/:id', authenticateToken, departmentController.updateDepartment);

// Delete department - requires authentication
departmentRouter.delete('/:id', authenticateToken, departmentController.deleteDepartment);

// Public read operations (no authentication required)
// Get all departments (no pagination) - must be before /:id route
departmentRouter.get('/all', authenticateToken, departmentController.getAllDepartments);

departmentRouter.get('/organization/:orgId', departmentController.getDepartmentsByOrganization);
departmentRouter.get('/:id', departmentController.getDepartmentById);
departmentRouter.get('/', departmentController.getDepartmentsPaginated);

export default departmentRouter;
