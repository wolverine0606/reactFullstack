import { RequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import UserModel from "../models/user";
import { sendErrorRes } from "../utils/helper";

interface UserProfile {
  id: object;
  name: string;
  email: string;
  verified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user: UserProfile;
    }
  }
}

export const isAuth: RequestHandler = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) return sendErrorRes(res, "unauthorized request", 403);

    const token = authToken.split("Bearer ")[1]; // ["Bearer", "token i need"]

    const payload = verify(token, "secret") as { id: string };

    const user = await UserModel.findById(payload.id);
    if (!user) return sendErrorRes(res, "unauthorized request", 403);

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
    };

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return sendErrorRes(res, "session expired", 401);
    }
    if (err instanceof JsonWebTokenError) {
      return sendErrorRes(res, `unauthorized access ${err}`, 403);
    }
    next(err);
  }
};
