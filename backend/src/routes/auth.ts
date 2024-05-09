import { Router } from "express";
import {
  GrandValid,
  blacklistById,
  createNewUser,
  generateForgetPassToken,
  generateVerificationLink,
  refreshVerificationToken,
  sendProfile,
  signIn,
  signOut,
  updatePassword,
  updateProfile,
  verifyEmail,
} from "src/controllers/auth";
import { isAuth, isValidPassResetToken } from "src/middleware/auth";
import isInBlackList from "src/middleware/isInBlacklist";
import validate from "src/middleware/validator";
import {
  ResetPassSchema,
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
// forget password
authRouter.post("/forget-pass", generateForgetPassToken);
authRouter.post(
  "/verify-pass-reset-token",
  validate(verifyTokenSchema),
  isValidPassResetToken,
  GrandValid
);
authRouter.post(
  "/reset-pass",
  validate(ResetPassSchema),
  isValidPassResetToken,
  updatePassword
);
authRouter.patch("/update-profile", isAuth, updateProfile);
export default authRouter;
