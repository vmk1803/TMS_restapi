import express, { Router } from "express";
import locationRouter from "./locationRouter";
import organizationRouter from "./organizationRouter";
import usersRouter from "./usersRouter";
import groupRouter from "./groupRouter";
import departmentRouter from "../departmentRouter";
import roleRouter from "../roleRouter";
import StatisticsController from "../../controllers/statisticsController";
import { isAuthorized } from "../../common/middlewares/auth";
import { requireUserOrAdminRole } from "../../common/middlewares/checkUserRole";

const userManagementRoutes: Router = express.Router();
const statisticsController = new StatisticsController();

// Enhanced Statistics route
userManagementRoutes.get('/statistics', isAuthorized, requireUserOrAdminRole, statisticsController.getUserStatistics);

// New Analytics routes
userManagementRoutes.get('/analytics/user-trends', isAuthorized, requireUserOrAdminRole, statisticsController.getUserTrends);
userManagementRoutes.get('/analytics/users-by-department', isAuthorized, requireUserOrAdminRole, statisticsController.getUsersByDepartment);
userManagementRoutes.get('/analytics/roles-breakdown', isAuthorized, requireUserOrAdminRole, statisticsController.getRolesBreakdownEndpoint);
userManagementRoutes.get('/analytics/organizations-overview', isAuthorized, requireUserOrAdminRole, statisticsController.getOrganizationsOverviewEndpoint);

// Location routes (with their own auth controls)
userManagementRoutes.use('/locations', locationRouter);

// Organization routes (with their own auth controls)
userManagementRoutes.use('/organizations', organizationRouter);

// User Management routes
userManagementRoutes.use('/users', usersRouter);

// Group routes (with their own auth controls)
userManagementRoutes.use('/groups', groupRouter);

userManagementRoutes.use("/departments", departmentRouter);

userManagementRoutes.use("/roles", roleRouter);


export default userManagementRoutes;
