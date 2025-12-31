import { Hono } from "hono";
import { canAddUser, canCreateRegularUser, canDeleteUser, canResetPassword, canUpdateUserStatus, canViewAllUsers } from "../middlewares/guards/guardUser";
import UserController from "../controllers/userController";
import isAuthorized from "../middlewares/isAuthorized";

const userRouter = new Hono();
const userController = new UserController();

userRouter.delete('/user-groups/:group_id', isAuthorized, userController.deleteUserGroup)
userRouter.get('/tasks', isAuthorized, userController.getUserAssignedTasks);
userRouter.get('/groups/:group_id/:user_id', isAuthorized, userController.getUserDetailsInGroup)
userRouter.get('/groups/all', isAuthorized, userController.getUserGroupsWithoutPagination)
userRouter.patch('/groups/update-user-details', isAuthorized, userController.updateUserDetailsInGroup)
userRouter.delete('/groups/remove-users', isAuthorized, userController.removeUsersFromGroup)
userRouter.patch('/groups/update-users', isAuthorized, userController.updateUsersInGroup)
userRouter.get('/groups/:group_id', isAuthorized, userController.getUserGroup)
userRouter.patch('/groups/:group_id', isAuthorized, userController.updateUserGroup)
userRouter.get('/groups', isAuthorized, userController.getAllUserGroups)
userRouter.get('/export', isAuthorized, userController.exportUsersData)
userRouter.get('/status-count', isAuthorized, userController.getUserWiseStatusCount)
userRouter.post('/', canCreateRegularUser, userController.createRegularUser)
userRouter.get('/', canViewAllUsers, userController.getUsersPaginated)
userRouter.get('/all', userController.getUsersWithOutPagination)
userRouter.get('/:id', isAuthorized, userController.getUserById)
userRouter.patch('/update-password', isAuthorized, userController.updatePassword)
userRouter.delete('/:id', canDeleteUser, userController.softDeleteUser)
userRouter.patch('/:id', isAuthorized, userController.updateUser)
userRouter.patch('/:id/status', canUpdateUserStatus, userController.updateUserStatus)
userRouter.patch('/:id/profile-pic', userController.uploadProfilePic)
userRouter.patch('/:id/reset-password', canResetPassword, userController.resetPasswordByAdmin)
userRouter.get('/:id/task-summary', isAuthorized, userController.getUserTaskSummary)
userRouter.post('/groups', isAuthorized, userController.addUserGroup)
userRouter.post('/groups/add-users', isAuthorized, userController.addUsersToGroup)

userRouter.post('/add', isAuthorized, canAddUser, userController.addUser)

export default userRouter