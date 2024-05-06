import { Router } from "express";
import { createNewUser, signIn, verifyEmail } from "../controllers/auth";
import validate from "../middleware/validator";
import { newUserSchema, verifyTokenSchema } from "../utils/schemas/user-schema";

const authRouter = Router();
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-up", validate(newUserSchema), createNewUser);
authRouter.post("/verify", validate(verifyTokenSchema), verifyEmail);
authRouter.post("/refresh-token");

export default authRouter;
