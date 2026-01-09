import express, { Router } from 'express';
import UserController from '../../controllers/userController';
import { requireUserRoleForUsers, requireUserOrAdminRole } from '../../common/middlewares/checkUserRole';
import { isAuthorized } from '../../common/middlewares/auth';

const usersRouter: Router = express.Router();
const userController = new UserController();

// Special routes (MUST come before /:id routes to avoid conflicts)
usersRouter.get('/my', isAuthorized, requireUserOrAdminRole, userController.getMyProfile);

// User CRUD routes
// Only admin can create, update, delete users
usersRouter.post('/', isAuthorized, requireUserRoleForUsers, userController.createUser);
usersRouter.patch('/:id', isAuthorized, requireUserRoleForUsers, userController.updateUser);
usersRouter.patch('/:id/reset-password', isAuthorized, requireUserRoleForUsers, userController.resetPasswordByAdmin);
usersRouter.delete('/:id', isAuthorized, requireUserRoleForUsers, userController.deleteUser);

// Read operations are available to authenticated users (users and admins)
usersRouter.get('/', isAuthorized, requireUserOrAdminRole, userController.getUsersPaginated);
usersRouter.get('/all', isAuthorized, requireUserOrAdminRole, userController.getAllUsers);
usersRouter.get('/:id', isAuthorized, requireUserOrAdminRole, userController.getUserById);

// Filter routes (after specific routes to avoid conflicts)
usersRouter.get('/organization/:organizationId', isAuthorized, requireUserOrAdminRole, userController.getUsersByOrganization);
usersRouter.get('/department/:departmentId', isAuthorized, requireUserOrAdminRole, userController.getUsersByDepartment);
usersRouter.get('/role/:roleId', isAuthorized, requireUserOrAdminRole, userController.getUsersByRole);

export default usersRouter;
