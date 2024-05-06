import { Router } from "express";
import {
  createNewUser,
  sendProfile,
  signIn,
  verifyEmail,
} from "../controllers/auth";
import validate from "../middleware/validator";
import { newUserSchema, verifyTokenSchema } from "../utils/schemas/user-schema";
import { isAuth } from "../middleware/auth";

const authRouter = Router();
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-up", validate(newUserSchema), createNewUser);
authRouter.post("/verify", validate(verifyTokenSchema), verifyEmail);
authRouter.get("/profile", isAuth, sendProfile);

authRouter.post("/refresh-token");

export default authRouter;
