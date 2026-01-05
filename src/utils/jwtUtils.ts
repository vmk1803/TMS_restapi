import { sign, verify } from "jsonwebtoken";
import { jwtConfig } from "../config/jwtConfig";
import { JWTUserPayload } from "../types/app.types";
import { Request } from "express";
import { DEF_400, TOKEN_EXPIRED, TOKEN_INVALID, TOKEN_MISSING, TOKEN_SIG_MISMATCH } from "../constants/appMessages";
import BadRequestException from "../exceptions/badRequestException";
import UnauthorizedException from "../exceptions/unauthorizedException";
import User from "../models/User";


const genJWTTokens = async (payload: JWTUserPayload) => {

  const access_token_expiry = Math.floor(Date.now() / 1000) + jwtConfig.expires_in; // 30 days

  const access_token_payload = {
    ...payload,
    exp: access_token_expiry
  };
  const refresh_token_payload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (jwtConfig.expires_in * 3) // 90 days
  };
  const access_token = await sign(access_token_payload, jwtConfig.secret);
  const refresh_token = await sign(refresh_token_payload, jwtConfig.secret);

  return {
    access_token,
    refresh_token,
    refresh_token_expires_at: refresh_token_payload.exp
  };

};

const genJWTTokensForUser = async (userId: number) => {
  // Create Payload
  const payload: JWTUserPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };

  // Generate Tokens
  return await genJWTTokens(payload);
};

const verifyJWTToken = async (token: string) => {
  try {
    const decodedPayload = await verify(token, jwtConfig.secret);
    return decodedPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedException(TOKEN_EXPIRED);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedException(TOKEN_INVALID);
    }
    if (error.name === 'NotBeforeError') {
      throw new UnauthorizedException(TOKEN_SIG_MISMATCH);
    }
    throw error;
  }
};

const getUserDetailsFromToken = async (req: Request) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7, authHeader.length);

    if (!token) {
      throw new UnauthorizedException(TOKEN_MISSING);
    }

    const decodedPayload = await verifyJWTToken(token);

    // Get user from MongoDB with populated role
    const user = await User.findById(decodedPayload.sub).populate('organizationDetails.role', 'name');

    if (!user) {
      throw new UnauthorizedException('User not found or invalid token');
    }

    const userObj = user.toObject();
    const { password, createdAt, updatedAt, ...userDetails } = userObj;

    return userDetails;

  } catch (error) {
    throw error;
  }
};



export {
  genJWTTokens,
  genJWTTokensForUser,
  verifyJWTToken,
  getUserDetailsFromToken,
};
