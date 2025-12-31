import express, { Router } from 'express';
import AuthController from '../controllers/authController';

const authRouter: Router = express.Router();
const authController = new AuthController();

authRouter.post('/login', authController.login);
// TODO: Add other routes when methods are implemented

export default authRouter;
