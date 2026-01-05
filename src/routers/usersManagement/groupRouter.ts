import express, { Router } from "express";
import GroupController from "../../controllers/groupController";
import { requireUserRoleForLocations, requireUserOrAdminRole } from "../../common/middlewares/checkUserRole";
import { isAuthorized } from "../../common/middlewares/auth";

const groupRouter: Router = express.Router();
const groupController = new GroupController();

// Group CRUD routes
// Only admin can create, update, delete groups
groupRouter.post('/', isAuthorized, requireUserRoleForLocations, groupController.createGroup);
groupRouter.patch('/:id', isAuthorized, requireUserRoleForLocations, groupController.updateGroup);
groupRouter.delete('/:id', isAuthorized, requireUserRoleForLocations, groupController.deleteGroup);

 // Read operations are available to authenticated users (users and admins)
groupRouter.get('/', isAuthorized, requireUserOrAdminRole, groupController.getGroupsPaginated);
groupRouter.get('/all', isAuthorized, requireUserOrAdminRole, groupController.getAllGroups);
groupRouter.get('/:id', isAuthorized, requireUserOrAdminRole, groupController.getGroupById);
groupRouter.get('/:id/members', isAuthorized, requireUserOrAdminRole, groupController.getGroupMembers);

export default groupRouter;
