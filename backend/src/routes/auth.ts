import { Router } from "express";
import {
  blacklistById,
  createNewUser,
  generateVerificationLink,
  refreshVerificationToken,
  sendProfile,
  signIn,
  verifyEmail,
} from "../controllers/auth";
import validate from "../middleware/validator";
import { newUserSchema, verifyTokenSchema } from "../utils/schemas/user-schema";
import { isAuth } from "../middleware/auth";
import isInBlackList from "../middleware/isInBlacklist";

const authRouter = Router();
authRouter.post("/sign-in", isInBlackList, signIn);
authRouter.post(
  "/sign-up",
  validate(newUserSchema),
  isInBlackList,
  createNewUser
);
authRouter.post("/verify", validate(verifyTokenSchema), verifyEmail);
authRouter.get("/profile", isAuth, sendProfile);
authRouter.post("/blacklist", blacklistById);
authRouter.get("/verify-token", isAuth, generateVerificationLink);
authRouter.post("/refresh-token", refreshVerificationToken);

export default authRouter;
