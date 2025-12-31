import express, { Router } from "express";
import locationRouter from "./locationRouter";
import organizationRouter from "./organizationRouter";
import departmentRouter from "../departmentRouter";

const userManagementRoutes: Router = express.Router();

// Location routes (with their own auth controls)
userManagementRoutes.use('/locations', locationRouter);

// Organization routes (with their own auth controls)
userManagementRoutes.use('/organizations', organizationRouter);

userManagementRoutes.use("/departments", departmentRouter);


export default userManagementRoutes;