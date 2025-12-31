import argon2 from "argon2";
import mongoose from "mongoose";
import { Response, Request } from "express";
import { sign } from "jsonwebtoken";
import { nanoid } from "nanoid";
import { appConfig } from "../config/appConfig";
import { ACCOUNT_INACTIVE, FP_EMAIL_SENT, LOGIN_CREDS_INVALID, LOGIN_DONE, LOGIN_EMAIL_NOT_FOUND, LOGIN_EMAIL_NOT_FOUND_SUPER_ADMIN, LOGIN_VALIDATION_ERROR, PASSWORD_RESET_DONE, PASSWORDS_VALIDATION_ERROR, RESET_TOKEN_NOT_FOUND, RT_NOT_FOUND, TOKENS_GENERATED, USER_NOT_FOUND } from "../constants/appMessages";

import NotFoundException from "../exceptions/notFoundException";
import UnauthorizedException from "../exceptions/unauthorizedException";

import { ValidatedForgotPassword } from "../validations/schema/vForgotPasswordSchema";
import { ValidatedLogin } from "../validations/schema/vLoginSchema";
import { validateRequest } from "../validations/validationRequest";
import { sendSuccessResp } from "../utils/respUtils";
import { reset_password_tokens, ResetPasswordToken } from "../db/schema/resetPasswordToken";
import { refresh_tokens, RefreshToken } from "../db/schema/refreshToken";
import { genJWTTokensForUser, verifyJWTToken } from "../utils/jwtUtils";
import { ValidatedResetPassword } from "../validations/schema/vUserSchema";
import { sendEmailToResetPassword } from "../services/notifications/emailServiceProvider";
import { asyncHandler } from "../common/middlewares/errorHandler";

// Define User schema for MongoDB - moved inside function to avoid connection issues
let MongoUser: any = null;

const getMongoUserModel = () => {
  if (!MongoUser) {
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      fname: { type: String, required: true },
      lname: { type: String, required: true },
      mname: String,
      phone_number: String,
      role: { type: String, required: true, default: 'user' },
      active: { type: Boolean, default: true },
      profile_pic: String,
      designation: String,
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now }
    });
    MongoUser = mongoose.model('User', userSchema);
  }
  return MongoUser;
};

export { getMongoUserModel };

class AuthController {

    login = asyncHandler(async (req: Request, res: Response) => {
        const loginData = req.body;

        const validatedLogin = await validateRequest<ValidatedLogin>('login', loginData, LOGIN_VALIDATION_ERROR);

        // Find user in MongoDB
        const MongoUserModel = getMongoUserModel();
        const user = await MongoUserModel.findOne({ email: validatedLogin.email });

        const userAllowed = await this._loginChecksMongo(user, validatedLogin.password);

        const tokensData = await this._generateTokensForMongoUser(userAllowed._id.toString());

        // Set cookie
        res.cookie('ATHID', tokensData.access_token, {
            domain: appConfig.cookie_domain,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Convert MongoDB document to plain object
        const userObj = userAllowed.toObject ? userAllowed.toObject() : userAllowed;
        const { password, ...user_details } = userObj;

        // Structure response to match frontend expectations
        const respData = {
            accessToken: tokensData.access_token,
            user: user_details
        };

        return sendSuccessResp(res, 200, LOGIN_DONE, respData, req);
    });

    // TODO: Convert other methods to Express when needed

    _loginChecksMongo = async (user: any, passwordProvided: string) => {
        if (!user) {
            console.log("Login attempt failed: user not found for email");
            throw new NotFoundException(LOGIN_EMAIL_NOT_FOUND);
        }

        if (!user.password) {
            console.log("Login attempt failed: password not set for user", user.email);
            throw new UnauthorizedException("Password not set for user");
        }

        //Validate Password
        try {
            const isValid = await argon2.verify(user.password, passwordProvided);
            if (!isValid) {
                console.log("Login attempt failed: invalid password for user", user.email);
                throw new UnauthorizedException(LOGIN_CREDS_INVALID);
            }
        } catch (error) {
            console.error("Password verification error:", error);
            throw new UnauthorizedException(LOGIN_CREDS_INVALID);
        }

        // User is not active
        if (!user.active) {
            console.log("Login attempt failed: account inactive for user", user.email);
            throw new UnauthorizedException(ACCOUNT_INACTIVE);
        }

        console.log("Login successful for user:", user.email);
        return user;
    };

    _generateTokensForMongoUser = async (userId: string) => {
        // Import JWT config
        const { jwtConfig } = await import("../config/jwtConfig");

        // Create JWT payload for MongoDB user
        const payload = {
            sub: userId, // MongoDB ObjectId as string
            iat: Math.floor(Date.now() / 1000),
        };

        const access_token_expiry = Math.floor(Date.now() / 1000) + jwtConfig.expires_in; // 30 days
        const refresh_token_expiry = Math.floor(Date.now() / 1000) + (jwtConfig.expires_in * 3); // 90 days

        const access_token_payload = {
            ...payload,
            exp: access_token_expiry
        };
        const refresh_token_payload = {
            ...payload,
            exp: refresh_token_expiry
        };

        const access_token = sign(access_token_payload, jwtConfig.secret);
        const refresh_token = sign(refresh_token_payload, jwtConfig.secret);

        return {
            access_token,
            refresh_token,
            refresh_token_expires_at: refresh_token_payload.exp
        };
    };


}

export default AuthController;
