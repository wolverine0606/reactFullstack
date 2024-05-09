import { RequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import PasswordResetTokenModel from "src/models/passwordResetToken";
import UserModel from "src/models/user";
import { sendErrorRes } from "src/utils/helper";

const JWT_SECRET = process.env.JWT_SECRET as string;

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
    console.log(token);

    const payload = verify(token, JWT_SECRET) as { id: string };
    console.log(payload.id);

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

export const isValidPassResetToken: RequestHandler = async (req, res, next) => {
  const { id, token } = req.body;
  const resetPassToken = await PasswordResetTokenModel.findOne({ owner: id });
  if (!resetPassToken)
    sendErrorRes(res, "Unauthorized request, invalid token", 403);
  // compare token
  const isValid = await resetPassToken!.compareToken(token);
  if (!isValid)
    sendErrorRes(res, "Unauthorized request, token is expired", 403);

  next();
};
