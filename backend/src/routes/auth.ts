import { Router } from "express";
import {
  blacklistById,
  createNewUser,
  generateVerificationLink,
  refreshVerificationToken,
  sendProfile,
  signIn,
  signOut,
  verifyEmail,
} from "src/controllers/auth";
import { isAuth } from "src/middleware/auth";
import isInBlackList from "src/middleware/isInBlacklist";
import validate from "src/middleware/validator";
import {
  newUserSchema,
  verifyTokenSchema,
} from "src/utils/schemas/user-schema";

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
authRouter.post("/sign-out", isAuth, signOut);

export default authRouter;
