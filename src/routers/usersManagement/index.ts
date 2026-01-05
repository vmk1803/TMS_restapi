import express, { Router } from "express";
import locationRouter from "./locationRouter";
import organizationRouter from "./organizationRouter";
import usersRouter from "./usersRouter";
import groupRouter from "./groupRouter";
import departmentRouter from "../departmentRouter";
import roleRouter from "../roleRouter";

const userManagementRoutes: Router = express.Router();

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
